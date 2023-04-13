require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({
  log: ["query", "info", "warn"],
});

app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/user", async (req, res) => {
  const username = req.body.name;

  try {
    const result = await checkUser(username);
    return res.status(201).json(result);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/users", async (req, res) => {
  const query = req.body.inputValue;
  const users = await getUsers(query);
  res.status(200).send(users);
});

app.get("/messages", async (req, res) => {
  const messages = await getMessages();
  res.status(200).send(messages);
});

app.post("/message", async (req, res) => {
  const sentMessage = req.body;
  try {
    const newMessage = await createMessage(sentMessage);

    console.log(newMessage);
    if (newMessage) {
      return res.status(201).json({ createdMessage: newMessage });
    } else {
      return res
        .status(500)
        .json({ error: "Sorry, there is no such recipient!" });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

async function getUsers(query) {
  const users = await prisma.user.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
    },
  });
  return users;
}

async function getMessages() {
  const messages = await prisma.messages.findMany();
  return messages;
}

async function checkUser(username) {
  let existingUsers = await prisma.user.findMany({
    where: {
      name: username,
    },
  });

  //[ { id: 1, name: 'John', messagesReceived: [] } ]
  if (existingUsers.length) {
    let allMessages = [];
    for (let user of existingUsers) {
      const messages = await prisma.messages.findMany({
        where: {
          recipient_id: user.id,
        },
        select: {
          content: true,
          createdAt: true,
        },
      });

      allMessages.push(...messages);
    }

    return { user: { name: username }, messages: allMessages };
  } else {
    const newUser = await prisma.user.create({
      data: { name: username },
      select: { name: true },
    });

    return { user: newUser, messages: [] };
  }
}

async function createMessage(message) {
  const recipients = await prisma.user.findMany({
    where: {
      name: message.recipientName,
    },
  });

  let createdMessage;

  if (recipients.length) {
    const sender = await prisma.user.findFirst({
      where: {
        name: message.senderName,
      },
    });

    for (let recipient of recipients) {
      const newMessage = await prisma.messages.create({
        data: {
          sender_id: sender.id,
          recipient_id: recipient.id,
          title: message.messageTitle,
          content: message.messageContent,
        },
      });

      createdMessage = newMessage;
    }
  } else {
    return null;
  }
  console.log(`new creatred message: ${createdMessage}`);
  return createdMessage;
}

// checkUser("John")
//   .then(async (user) => {
//     console.log(user);
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`server started on port ${port}`, []);
});
