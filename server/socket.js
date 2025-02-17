import { Server } from "socket.io";
import verifyToken from "./utils/verifyToken.js";
import User from "./models/User.model.js";
import mongoose from "mongoose";
import Message from "./models/Message.model.js";
import Emoji from "./models/Emoji.model.js";
import Chat from "./models/Chat.model.js";
import Group from "./models/Group.model.js";
import i18next from "i18next";
export default function initializeSocket(server) {
  // web sockets
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });
  //online users
  const onlineUsers = new Map();

  io.on("connection", async (socket) => {
    console.log("connection");
    // getting current user form auth token
    const currentUser = await verifyToken(socket?.handshake?.auth?.token);
    // connection message
    console.log(`${currentUser?.name} is Connected.`);
    // create room
    // socket.join(currentUser?._id?.toString());
    // console.log(`${currentUser?.name} join to his room.`);
    // join to groups
    const userGroups = await getUserGroups(currentUser?._id);
    if (userGroups.length > 0) {
      userGroups.forEach((group) => {
        socket.join(group?._id?.toString());
        console.log(
          ` ${currentUser?.name} joined to : `,
          group?._id?.toString()
        );
      });
    }
    // get connected users
    connected(socket?.id, currentUser, onlineUsers);

    // onlineUsers
    io.emit("onlineUsers", Array.from(onlineUsers));

    //chatMessagePage
    socket.on("chatMessagePage", async (userId) => {
      console.log("chatMessagePage");
      if (mongoose.Types.ObjectId.isValid(userId?.toString())) {
        const user = await User.findById(userId?.toString()).select(
          "_id name email avatar rgb createdAt last_seen"
        );
        const chat = await Chat.findOne({
          $or: [
            {
              sender: currentUser?._id?.toString(),
              receiver: userId?.toString(),
            },
            {
              sender: userId?.toString(),
              receiver: currentUser?._id?.toString(),
            },
          ],
        }).populate({
          path: "messages",
          populate: [
            {
              path: "sender",
              model: "Users",
              select: "name email _id avatar rgb",
            },
            {
              path: "emojis",
              model: "Emojis",
            },
          ],
          model: "Messages",
        });

        if (user) {
          io.to(onlineUsers.get(currentUser?._id?.toString())?.socketId).emit(
            "chatMessagePage",
            {
              // user: user,
              user: user?._doc,
              messages: chat?.messages || [],
            }
          );
          if (onlineUsers.has(userId)) {
            io.to(onlineUsers.get(userId?.toString())?.socketId).emit(
              "chatMessagePage",
              {
                // user: user,
                user: currentUser,
                messages: chat?.messages || [],
              }
            );
          }
        } else {
          socket.emit("error", { message: i18next.t("chatNotFound") });
        }
      } else {
        socket.emit("error", { message: i18next.t("invalidChatId") });
      }
    });

    //newChatMessage
    socket.on("newChatMessage", async (msg) => {
      console.log("newChatMessage");
      let chat = await Chat.findOne({
        $or: [
          {
            sender: msg?.sender?.toString(),
            receiver: msg?.receiver?.toString(),
          },
          {
            sender: msg?.receiver?.toString(),
            receiver: msg?.sender?.toString(),
          },
        ],
      });
      if (!chat) {
        const newChat = new Chat({
          sender: msg?.sender?.toString(),
          receiver: msg?.receiver?.toString(),
        });
        chat = await newChat.save();
      }

      let message = new Message({
        ...msg,
      });
      const savedMessage = await message.save();
      const updatedChat = await Chat.findByIdAndUpdate(
        chat?._id,
        { $push: { messages: savedMessage?._id?.toString() } },
        { new: true }
      )
        .populate({
          path: "messages",
          populate: [
            {
              path: "sender",
              model: "Users",
              select: "name email _id avatar rgb",
            },
            {
              path: "emojis",
              model: "Emojis",
            },
          ],
          model: "Messages",
        })
        .populate({
          path: "sender",
          model: "Users",
          select: "name email _id avatar rgb",
        })
        .populate({
          path: "receiver",
          model: "Users",
          select: "name email _id avatar rgb",
        });

      // sending new Chat messages
      io.to(onlineUsers.get(msg?.sender?.toString())?.socketId).emit(
        "chatMessages",
        updatedChat?.messages || []
      );
      io.to(onlineUsers.get(msg?.receiver?.toString())?.socketId).emit(
        "chatMessages",
        updatedChat?.messages || []
      );
      // sending new chat
      // io.to(onlineUsers.get(msg?.receiver?.toString()).socketId).emit(
      io.to(onlineUsers.get(msg?.sender?.toString())?.socketId).emit(
        "updatedChat",
        {
          ...updatedChat?._doc,
          lastMessage: updatedChat?.messages[updatedChat?.messages?.length - 1],
          unSeen: 0,
        } || null
      );
      io.to(onlineUsers.get(msg?.receiver?.toString())?.socketId).emit(
        "updatedChat",
        {
          ...updatedChat?._doc,
          lastMessage: updatedChat?.messages[updatedChat?.messages?.length - 1],
          unSeen: updatedChat?.messages?.reduce((pre, cur) => {
            if (
              cur?.sender?._id?.toString() == currentUser?._id?.toString() &&
              cur?.seen === false
            ) {
              return pre + 1;
            } else {
              return 0;
            }
          }, 0),
        } || null
      );
      io.to(onlineUsers.get(msg?.receiver?.toString())?.socketId).emit(
        "newMessage",
        {
          sender:
            updatedChat?._doc?.sender?._id?.toString() ==
            currentUser?._id?.toString()
              ? updatedChat?._doc?.sender
              : updatedChat?._doc?.receiver,
        } || null
      );
    });

    //getMyChats
    socket.on("getMyChats", async () => {
      console.log("getMyChats");

      const chatsList = await getUserChats(currentUser?._id);
      socket.emit("getMyChats", chatsList);
    });

    //chatMessageSeen
    socket.on("chatMessageSeen", async (receiverId) => {
      console.log("chatMessageSeen");

      if (mongoose.Types.ObjectId.isValid(receiverId?.toString())) {
        let chat = await Chat.findOne({
          $or: [
            {
              sender: currentUser?._id?.toString(),
              receiver: receiverId?.toString(),
            },
            {
              sender: receiverId?.toString(),
              receiver: currentUser?._id?.toString(),
            },
          ],
        });
        const results = await Message.updateMany(
          {
            _id: { $in: chat?.messages },
            sender: receiverId?.toString(),
            seen: false,
          },
          {
            $set: {
              seen: true,
            },
          }
        );
        chat = await Chat.findById(chat?._doc?._id)
          .populate({
            path: "messages",
            populate: [
              {
                path: "sender",
                model: "Users",
                select: "name email _id avatar rgb",
              },
              {
                path: "emojis",
                model: "Emojis",
              },
            ],
            model: "Messages",
          })
          .populate({
            path: "sender",
            model: "Users",
            select: "name email _id avatar rgb",
          })
          .populate({
            path: "receiver",
            model: "Users",
            select: "name email _id avatar rgb",
          });

        if (chat) {
          io.to(onlineUsers.get(currentUser?._id?.toString())?.socketId).emit(
            "updatedChat",
            {
              ...chat?._doc,
              lastMessage: chat?.messages?.[chat?.messages?.length - 1],
              unSeen: 0,
            } || null
          );
          if (results?.modifiedCount > 0) {
            io.to(onlineUsers.get(receiverId?.toString())?.socketId).emit(
              "chatMessages",
              chat?.messages || []
            );
          }
        } else {
          socket.emit("error", { message: i18next.t("chatNotFound") });
        }
      } else {
        socket.emit("error", { message: i18next.t("invalidChatId") });
      }
    });

    //updateChatMessageEmoji
    socket.on(
      "updateChatMessageEmoji",
      async ({ emoji, msgId, receiverId }) => {
        console.log("updateChatMessageEmoji");

        if (
          mongoose.Types.ObjectId.isValid(msgId?.toString()) &&
          mongoose.Types.ObjectId.isValid(receiverId?.toString())
        ) {
          // getting chat
          let chat = await Chat.findOne({
            $or: [
              {
                sender: currentUser?._id?.toString(),
                receiver: receiverId?.toString(),
              },
              {
                sender: receiverId?.toString(),
                receiver: currentUser?._id?.toString(),
              },
            ],
          });

          // finding message to update its emoji
          const messageToUpdate = await Message.findOne({
            $and: [{ _id: { $in: chat?.messages } }, { _id: msgId }],
          });

          // if no emojis
          if (messageToUpdate?.emojis?.length === 0) {
            // first one
            const emoji1 = new Emoji({ ...emoji });
            await emoji1.save();
            await Message.updateOne(
              { _id: messageToUpdate?._id },
              {
                $push: { emojis: emoji1 },
              }
            );
          }
          // if there are an existing emojis
          else {
            let emoji1 = await Emoji.findOne({
              $and: [
                { value: emoji?.value },
                { maker: emoji?.maker },
                { message: emoji?.message },
              ],
            });
            let emoji2 = await Emoji.findOne({
              $and: [
                { value: { $ne: emoji?.value } },
                { maker: emoji?.maker },
                { message: emoji?.message },
              ],
            });

            if (emoji1) {
              await Emoji.deleteOne({ _id: emoji1?._id });
              await Message.updateOne(
                { _id: messageToUpdate?._id },
                {
                  $pull: { emojis: emoji1?._id },
                }
              );
            } else if (emoji2) {
              await Emoji.deleteOne({ _id: emoji2?._id });
              await Message.updateOne(
                { _id: messageToUpdate?._id },
                {
                  $pull: { emojis: emoji2?._id },
                }
              );
              const emoji1 = new Emoji({ ...emoji });
              await emoji1.save();
              await Message.updateOne(
                { _id: messageToUpdate?._id },
                {
                  $push: { emojis: emoji1 },
                }
              );
            } else {
              const emoji1 = new Emoji({ ...emoji });
              await emoji1.save();
              await Message.updateOne(
                { _id: messageToUpdate?._id },
                {
                  $push: { emojis: emoji1 },
                }
              );
            }
          }

          // getting chat after updating message emoji
          // chat = await Chat.findById(chat?._id)
          chat = await Chat.findById(chat?._doc?._id)
            .populate({
              path: "messages",
              populate: [
                {
                  path: "sender",
                  model: "Users",
                  select: "name email _id avatar rgb",
                },
                {
                  path: "emojis",
                  model: "Emojis",
                },
              ],
              model: "Messages",
            })
            .populate({
              path: "sender",
              model: "Users",
              select: "name email _id avatar rgb",
            })
            .populate({
              path: "receiver",
              model: "Users",
              select: "name email _id avatar rgb",
            });

          if (chat) {
            io.to(onlineUsers.get(currentUser?._id?.toString())?.socketId).emit(
              "chatMessages",
              chat?.messages || []
            );
            if (onlineUsers.has(receiverId)) {
              io.to(onlineUsers.get(receiverId?.toString())?.socketId).emit(
                "chatMessages",
                chat?.messages || []
              );
            }
          } else {
            socket.emit("error", { message: i18next.t("chatNotFound") });
          }
        } else {
          socket.emit("error", { message: i18next.t("invalidChatId") });
        }
      }
    );

    //isTyping
    socket.on("isTyping", ({ state, receiver }) => {
      io.to(onlineUsers.get(receiver?.toString())?.socketId).emit("isTyping", {
        isTyping: state,
      });
    });

    ////////////////////////////////////////////////////////////////////////////

    //newGroupMessage
    socket.on("newGroupMessage", async ({ message, groupId }) => {
      console.log("newGroupMessage");

      let group = await Group.findById(groupId);
      if (group) {
        let msg = new Message({
          ...message,
        });
        const savedMessage = await msg.save();
        group = await Group.findByIdAndUpdate(
          groupId,
          { $push: { messages: savedMessage?._id?.toString() } },
          { new: true }
        ).populate({
          path: "messages",
          populate: [
            {
              path: "sender",
              model: "Users",
              select: "name email _id avatar rgb",
            },
            {
              path: "emojis",
              model: "Emojis",
            },
          ],
          model: "Messages",
        });
      }
      const { _id, rgb, messages, avatar, createdAt, name } = group;
      // getting new group messages
      io.to(group?._id?.toString()).emit("groupMessages", messages || []);
      // getting new group chat
      io.to(onlineUsers.get(currentUser?._id?.toString())?.socketId).emit(
        "updatedGroup",
        {
          _id,
          createdAt,
          name,
          rgb,
          avatar,
          lastMessage: messages?.[messages?.length - 1],
          unSeen: 0,
        } || null
      );
      socket.to(group?._id?.toString()).emit(
        "updatedGroup",
        {
          _id,
          createdAt,
          name,
          rgb,
          avatar,
          lastMessage: messages?.[messages?.length - 1],
          unSeen: messages?.reduce((pre, cur) => {
            if (
              cur?.sender?._id?.toString() == currentUser?._id?.toString() &&
              cur?.seen === false
            ) {
              return pre + 1;
            }
            return 0;
          }, 0),
        } || null
      );
      socket.to(group?._id?.toString()).emit(
        "newMessage",
        {
          sender: { _id, name, rgb, avatar },
        } || null
      );
    });

    //joinGroup
    socket.on("joinGroup", async (groupId) => {
      console.log("joinGroup");

      const group = await Group.findById(groupId);
      if (!group?.members?.includes(currentUser?._id?.toString())) {
        await Group.updateOne(
          { _id: groupId },
          { $push: { members: currentUser?._id?.toString() } }
        );

        // Join the group room
        socket.join(group?._id?.toString());
        console.log(
          ` ${currentUser?.name} joined to : `,
          group?._id?.toString()
        );
      }
    });

    //newGroup
    socket.on("newGroup", async (group) => {
      console.log("newGroup");

      let newGroup = new Group({
        ...group,
      });
      newGroup = await newGroup.save();
      newGroup = await Group.findById(newGroup?._id);
      // join to this group
      socket.join(newGroup?._id?.toString());
      socket.emit("newGroup", newGroup);
    });

    //groupMessagePage
    socket.on("groupMessagePage", async (groupId) => {
      console.log("groupMessagePage");

      if (mongoose.Types.ObjectId.isValid(groupId?.toString())) {
        const group = await Group.findById(groupId?.toString())
          .select("-admin")
          .populate({
            path: "messages",
            populate: [
              {
                path: "sender",
                model: "Users",
                select: "name email _id avatar rgb",
              },
              {
                path: "emojis",
                model: "Emojis",
              },
            ],
            model: "Messages",
          })
          .populate({
            path: "members",
            model: "Users",
            select: "name email _id avatar rgb",
          });

        if (group) {
          io.to(groupId).emit("groupMessagePage", {
            group,
            messages: group?.messages || [],
          });
        } else {
          socket.emit("error", { message: i18next.t("groupNotFound") });
        }
      } else {
        socket.emit("error", { message: i18next.t("invalidGroupId") });
      }
    });

    //getMyGroups
    socket.on("getMyGroups", async () => {
      console.log("getMyGroups");

      const groupsList = await getUserGroups(currentUser?._id);
      socket.emit("getMyGroups", groupsList);
    });

    //updateGroupMessageEmoji
    socket.on("updateGroupMessageEmoji", async ({ emoji, msgId, groupId }) => {
      console.log("updateGroupMessageEmoji");

      if (
        mongoose.Types.ObjectId.isValid(msgId?.toString()) &&
        mongoose.Types.ObjectId.isValid(groupId?.toString())
      ) {
        // getting group
        let group = await Group.findById(groupId);
        const groupMessages = group?.messages || [];

        // finding message to update its emoji
        const messageToUpdate = await Message.findOne({
          $and: [{ _id: { $in: groupMessages } }, { _id: msgId }],
        });

        // if no emojis
        if (messageToUpdate?.emojis?.length === 0) {
          // first one
          const emoji1 = new Emoji({ ...emoji });
          await emoji1.save();
          await Message.updateOne(
            { _id: messageToUpdate?._id },
            {
              $push: { emojis: emoji1 },
            }
          );
        }
        // if there are an existing emojis
        else {
          let emoji1 = await Emoji.findOne({
            $and: [
              { value: emoji?.value },
              { maker: emoji?.maker },
              { message: emoji?.message },
            ],
          });
          let emoji2 = await Emoji.findOne({
            $and: [
              { value: { $ne: emoji?.value } },
              { maker: emoji?.maker },
              { message: emoji?.message },
            ],
          });

          if (emoji1) {
            await Emoji.deleteOne({ _id: emoji1?._id });
            await Message.updateOne(
              { _id: messageToUpdate?._id },
              {
                $pull: { emojis: emoji1?._id },
              }
            );
          } else if (emoji2) {
            await Emoji.deleteOne({ _id: emoji2?._id });
            await Message.updateOne(
              { _id: messageToUpdate?._id },
              {
                $pull: { emojis: emoji2?._id },
              }
            );
            const emoji1 = new Emoji({ ...emoji });
            await emoji1.save();
            await Message.updateOne(
              { _id: messageToUpdate?._id },
              {
                $push: { emojis: emoji1 },
              }
            );
          } else {
            const emoji1 = new Emoji({ ...emoji });
            await emoji1.save();
            await Message.updateOne(
              { _id: messageToUpdate?._id },
              {
                $push: { emojis: emoji1 },
              }
            );
          }
        }

        // getting group after updating message emoji
        group = await Group.findById(group?._id).populate({
          path: "messages",
          populate: [
            {
              path: "sender",
              model: "Users",
              select: "name email _id avatar rgb",
            },
            {
              path: "emojis",
              model: "Emojis",
            },
          ],
          model: "Messages",
        });

        // sending updated group
        if (group) {
          io.to(groupId?.toString()).emit(
            "groupMessages",
            group?.messages || []
          );
        } else {
          socket.emit("error", { message: i18next.t("groupNotFound") });
        }
      } else {
        socket.emit("error", { message: i18next.t("invalidGroupId") });
      }
    });

    //groupMessageSeen
    socket.on("groupMessageSeen", async (groupId) => {
      console.log("groupMessageSeen");

      if (mongoose.Types.ObjectId.isValid(groupId?.toString())) {
        let group = await Group.findById(groupId);
        const groupMessages = group?.messages || [];

        const results = await Message.updateMany(
          {
            _id: { $in: groupMessages },
            sender: { $ne: currentUser?._id?.toString() },
            seen: false,
          },
          {
            $set: {
              seen: true,
            },
          }
        );
        group = await Group.findById(group?._id).populate({
          path: "messages",
          populate: [
            {
              path: "sender",
              model: "Users",
              select: "name email _id avatar rgb",
            },
            {
              path: "emojis",
              model: "Emojis",
            },
          ],
          model: "Messages",
        });

        if (group) {
          // sending updated group
          io.to(onlineUsers.get(currentUser?._id?.toString())?.socketId).emit(
            "updatedGroup",
            {
              ...group._doc,
              lastMessage: group?.messages?.[group?.messages?.length - 1],
              unSeen: 0,
            } || null
          );
          if (results?.modifiedCount > 0) {
            io.to(groupId?.toString()).emit(
              "groupMessages",
              group?.messages || []
            );
          }
        } else {
          socket.emit("error", { message: i18next.t("groupNotFound") });
        }
      } else {
        socket.emit("error", { message: i18next.t("invalidGroupId") });
      }
    });

    // search
    socket.on("search", async (keyword) => {
      console.log("search");

      // users
      const users = await User.find({
        $or: [
          {
            name: { $regex: keyword, $options: "i" },
          },
          {
            email: { $regex: keyword, $options: "i" },
          },
        ],
        $nor: [{ name: currentUser?.name }, { email: currentUser?.email }],
      });
      // users count
      const usersTotalCount = await User.find({
        $or: [
          {
            name: { $regex: keyword, $options: "i" },
          },
          {
            email: { $regex: keyword, $options: "i" },
          },
        ],
        $nor: [{ name: currentUser?.name }, { email: currentUser?.email }],
      }).countDocuments();
      // groups;
      const groups = await Group.find({
        name: { $regex: keyword, $options: "i" },
      });
      // groups count
      const groupsTotalCount = await Group.find({
        name: { $regex: keyword, $options: "i" },
      }).countDocuments();

      if (users.length === 0 && groups.length === 0) {
        socket.emit("searchResults", { message: "Not found." });
      } else {
        socket.emit("searchResults", {
          // message: "This is the search results.",
          data: {
            users,
            usersTotalCount,
            groups,
            groupsTotalCount,
          },
        });
      }
    });

    //////////////////////////////////////////////////////////////////////
    // gogo
    // socket.on("signal", (data) => {
    //   const { signal, to } = data;
    //   io.to(to).emit("signal", { signal, from: socket.id });
    // });
    //////////////////////////////////////////////////////////////////////

    // disconnect
    socket.on("disconnect", async () => {
      console.log("disconnect");

      // disconnect message
      console.log(`${currentUser?.name} disconnected`);
      disconnected(currentUser?._id, onlineUsers);
      const last_seen = new Date().toLocaleString();
      await User.updateOne({ _id: currentUser?._id }, { $set: { last_seen } });

      // update online users
      io.emit("onlineUsers", Array.from(onlineUsers));
      io.emit("lastSeen", last_seen);
    });
  });
}

async function getUserChats(userId) {
  const Chats = await Chat.find({
    $or: [{ sender: userId?.toString() }, { receiver: userId?.toString() }],
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "messages",
      populate: [
        {
          path: "sender",
          model: "Users",
          select: "name email _id avatar rgb",
        },
        {
          path: "emojis",
          model: "Emojis",
        },
      ],
      model: "Messages",
    })
    .populate({
      path: "sender",
      model: "Users",
      select: "name email _id avatar rgb",
    })
    .populate({
      path: "receiver",
      model: "Users",
      select: "name email _id avatar rgb",
    });
  const ChatsList = Chats.map(
    ({ sender, receiver, messages, _id, createdAt }) => {
      return {
        sender,
        receiver,
        messages,
        _id,
        createdAt,
        lastMessage: messages?.[messages?.length - 1],
        unSeen: messages?.reduce((pre, cur) => {
          if (
            cur?.sender?._id?.toString() !== userId?.toString() &&
            cur?.seen === false
          ) {
            return pre + 1;
          }
          return 0;
        }, 0),
      };
    }
  );
  return ChatsList;
}

async function getUserGroups(userId) {
  const groups = await Group.find({
    members: userId?.toString(),
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "messages",
      populate: [
        {
          path: "sender",
          model: "Users",
          select: "name email _id avatar rgb",
        },
        {
          path: "emojis",
          model: "Emojis",
        },
      ],
      model: "Messages",
    });

  const groupsList = groups?.map(
    ({ messages, name, createdAt, avatar, _id, rgb }) => {
      return {
        name,
        createdAt,
        avatar,
        _id,
        rgb,
        lastMessage: messages?.[messages?.length - 1],
        unSeen: messages?.reduce((pre, cur) => {
          if (
            cur?.sender?._id?.toString() !== userId?.toString() &&
            cur?.seen === false
          ) {
            return pre + 1;
          }
          return 0;
        }, 0),
      };
    }
  );
  return groupsList;
}

function connected(socketId, user, onlineUsers) {
  onlineUsers.set(user?._id?.toString(), { socketId, data: user });
}

function disconnected(userId, onlineUsers) {
  onlineUsers.delete(userId?.toString());
}

/*
import { Server } from "socket.io";
import verifyToken from "./utils/verifyToken.js";
import User from "./models/User.model.js";
import mongoose from "mongoose";
import Message from "./models/Message.model.js";
import Emoji from "./models/Emoji.model.js";
import Chat from "./models/Chat.model.js";
import Group from "./models/Group.model.js";

export default function initializeSocket(server) {
  // web sockets
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });
  //online users
  const onlineUsers = new Set();
  const onlineUsersData = [];

  io.on("connection", async (socket) => {
    console.log("connection");
    // getting current user form auth token
    const currentUser = await verifyToken(socket?.handshake?.auth?.token);
    // connection message
    console.log(`${currentUser?.name} is Connected.`);
    // create room
    socket.join(currentUser?._id?.toString());
    console.log(`${currentUser?.name} join to his room.`);
    // join to groups
    const userGroups = await getUserGroups(currentUser?._id);
    if (userGroups.length > 0) {
      userGroups.forEach((group) => {
        socket.join(group?._id?.toString());
        console.log(
          ` ${currentUser?.name} joined to : `,
          group?._id?.toString()
        );
      });
    }
    // get connected users
    connected(currentUser, onlineUsers, onlineUsersData);

    // onlineUsers
    io.emit("onlineUsers", Array.from(onlineUsers));
    // onlineUsersData
    io.emit("onlineUsersData", onlineUsersData);

    //chatMessagePage
    socket.on("chatMessagePage", async (userId) => {
      console.log("chatMessagePage");
      if (mongoose.Types.ObjectId.isValid(userId?.toString())) {
        const user = await User.findById(userId?.toString()).select(
          "_id name email avatar rgb createdAt last_seen"
        );
        const chat = await Chat.findOne({
          $or: [
            {
              sender: currentUser?._id?.toString(),
              receiver: userId?.toString(),
            },
            {
              sender: userId?.toString(),
              receiver: currentUser?._id?.toString(),
            },
          ],
        }).populate({
          path: "messages",
          populate: [
            {
              path: "sender",
              model: "Users",
              select: "name email _id avatar rgb",
            },
            {
              path: "emojis",
              model: "Emojis",
            },
          ],
          model: "Messages",
        });

        if (user) {
          io.to(currentUser?._id?.toString()).emit("chatMessagePage", {
            // user: user,
            user: user?._doc,
            messages: chat?.messages || [],
          });
          if (onlineUsers.has(userId)) {
            io.to(userId).emit("chatMessagePage", {
              // user: user,
              user: currentUser,
              messages: chat?.messages || [],
            });
          }
        } else {
          socket.emit("error", { message: i18next.t("chatNotFound") });
        }
      } else {
        socket.emit("error", { message: i18next.t("invalidChatId") });
      }
    });

    //newChatMessage
    socket.on("newChatMessage", async (msg) => {
      console.log("newChatMessage");
      let chat = await Chat.findOne({
        $or: [
          {
            sender: msg?.sender?.toString(),
            receiver: msg?.receiver?.toString(),
          },
          {
            sender: msg?.receiver?.toString(),
            receiver: msg?.sender?.toString(),
          },
        ],
      });
      if (!chat) {
        const newChat = new Chat({
          sender: msg?.sender?.toString(),
          receiver: msg?.receiver?.toString(),
        });
        chat = await newChat.save();
      }

      let message = new Message({
        ...msg,
      });
      const savedMessage = await message.save();
      const updatedChat = await Chat.findByIdAndUpdate(
        chat?._id,
        { $push: { messages: savedMessage?._id?.toString() } },
        { new: true }
      )
        .populate({
          path: "messages",
          populate: [
            {
              path: "sender",
              model: "Users",
              select: "name email _id avatar rgb",
            },
            {
              path: "emojis",
              model: "Emojis",
            },
          ],
          model: "Messages",
        })
        .populate({
          path: "sender",
          model: "Users",
          select: "name email _id avatar rgb",
        })
        .populate({
          path: "receiver",
          model: "Users",
          select: "name email _id avatar rgb",
        });

      // sending new Chat messages
      io.to(msg?.sender?.toString()).emit(
        "chatMessages",
        updatedChat?.messages || []
      );
      io.to(msg?.receiver?.toString()).emit(
        "chatMessages",
        updatedChat?.messages || []
      );
      // sending new chat
      io.to(msg?.receiver?.toString()).emit(
        "updatedChat",
        {
          ...updatedChat?._doc,
          lastMessage: updatedChat?.messages[updatedChat?.messages?.length - 1],
          unSeen: 0,
        } || null
      );
      io.to(msg?.receiver?.toString()).emit(
        "updatedChat",
        {
          ...updatedChat?._doc,
          lastMessage: updatedChat?.messages[updatedChat?.messages?.length - 1],
          unSeen: updatedChat?.messages?.reduce((pre, cur) => {
            if (
              cur?.sender?._id?.toString() == currentUser?._id?.toString() &&
              cur?.seen === false
            ) {
              return pre + 1;
            } else {
              return 0;
            }
          }, 0),
        } || null
      );
      io.to(msg?.receiver?.toString()).emit(
        "newMessage",
        {
          sender:
            updatedChat?._doc?.sender?._id?.toString() ==
            currentUser?._id?.toString()
              ? updatedChat?._doc?.sender
              : updatedChat?._doc?.receiver,
        } || null
      );
    });

    //getMyChats
    socket.on("getMyChats", async () => {
      console.log("getMyChats");

      const chatsList = await getUserChats(currentUser?._id);
      socket.emit("getMyChats", chatsList);
    });

    //chatMessageSeen
    socket.on("chatMessageSeen", async (receiverId) => {
      console.log("chatMessageSeen");

      if (mongoose.Types.ObjectId.isValid(receiverId?.toString())) {
        let chat = await Chat.findOne({
          $or: [
            {
              sender: currentUser?._id?.toString(),
              receiver: receiverId?.toString(),
            },
            {
              sender: receiverId?.toString(),
              receiver: currentUser?._id?.toString(),
            },
          ],
        });
        const results = await Message.updateMany(
          {
            _id: { $in: chat?.messages },
            sender: receiverId?.toString(),
            seen: false,
          },
          {
            $set: {
              seen: true,
            },
          }
        );
        chat = await Chat.findById(chat?._doc?._id)
          .populate({
            path: "messages",
            populate: [
              {
                path: "sender",
                model: "Users",
                select: "name email _id avatar rgb",
              },
              {
                path: "emojis",
                model: "Emojis",
              },
            ],
            model: "Messages",
          })
          .populate({
            path: "sender",
            model: "Users",
            select: "name email _id avatar rgb",
          })
          .populate({
            path: "receiver",
            model: "Users",
            select: "name email _id avatar rgb",
          });

        if (chat) {
          io.to(currentUser?._id?.toString()).emit(
            "updatedChat",
            {
              ...chat?._doc,
              lastMessage: chat?.messages?.[chat?.messages?.length - 1],
              unSeen: 0,
            } || null
          );
          if (results?.modifiedCount > 0) {
            // io.to(currentUser?._id?.toString()).emit(
            //   "chatMessages",
            //   chat?.messages || []
            // );
            io.to(receiverId?.toString()).emit(
              "chatMessages",
              chat?.messages || []
            );
          }
        } else {
          socket.emit("error", { message: i18next.t("chatNotFound") });
        }
      } else {
        socket.emit("error", { message: i18next.t("invalidChatId") });
      }
    });

    //updateChatMessageEmoji
    socket.on(
      "updateChatMessageEmoji",
      async ({ emoji, msgId, receiverId }) => {
        console.log("updateChatMessageEmoji");

        if (
          mongoose.Types.ObjectId.isValid(msgId?.toString()) &&
          mongoose.Types.ObjectId.isValid(receiverId?.toString())
        ) {
          // getting chat
          let chat = await Chat.findOne({
            $or: [
              {
                sender: currentUser?._id?.toString(),
                receiver: receiverId?.toString(),
              },
              {
                sender: receiverId?.toString(),
                receiver: currentUser?._id?.toString(),
              },
            ],
          });

          // finding message to update its emoji
          const messageToUpdate = await Message.findOne({
            $and: [{ _id: { $in: chat?.messages } }, { _id: msgId }],
          });

          // if no emojis
          if (messageToUpdate?.emojis?.length === 0) {
            // first one
            const emoji1 = new Emoji({ ...emoji });
            await emoji1.save();
            await Message.updateOne(
              { _id: messageToUpdate?._id },
              {
                $push: { emojis: emoji1 },
              }
            );
          }
          // if there are an existing emojis
          else {
            let emoji1 = await Emoji.findOne({
              $and: [
                { value: emoji?.value },
                { maker: emoji?.maker },
                { message: emoji?.message },
              ],
            });
            let emoji2 = await Emoji.findOne({
              $and: [
                { value: { $ne: emoji?.value } },
                { maker: emoji?.maker },
                { message: emoji?.message },
              ],
            });

            if (emoji1) {
              await Emoji.deleteOne({ _id: emoji1?._id });
              await Message.updateOne(
                { _id: messageToUpdate?._id },
                {
                  $pull: { emojis: emoji1?._id },
                }
              );
            } else if (emoji2) {
              await Emoji.deleteOne({ _id: emoji2?._id });
              await Message.updateOne(
                { _id: messageToUpdate?._id },
                {
                  $pull: { emojis: emoji2?._id },
                }
              );
              const emoji1 = new Emoji({ ...emoji });
              await emoji1.save();
              await Message.updateOne(
                { _id: messageToUpdate?._id },
                {
                  $push: { emojis: emoji1 },
                }
              );
            } else {
              const emoji1 = new Emoji({ ...emoji });
              await emoji1.save();
              await Message.updateOne(
                { _id: messageToUpdate?._id },
                {
                  $push: { emojis: emoji1 },
                }
              );
            }
          }

          // getting chat after updating message emoji
          // chat = await Chat.findById(chat?._id)
          chat = await Chat.findById(chat?._doc?._id)
            .populate({
              path: "messages",
              populate: [
                {
                  path: "sender",
                  model: "Users",
                  select: "name email _id avatar rgb",
                },
                {
                  path: "emojis",
                  model: "Emojis",
                },
              ],
              model: "Messages",
            })
            .populate({
              path: "sender",
              model: "Users",
              select: "name email _id avatar rgb",
            })
            .populate({
              path: "receiver",
              model: "Users",
              select: "name email _id avatar rgb",
            });

          if (chat) {
            io.to(currentUser?._id?.toString()).emit(
              "chatMessages",
              chat?.messages || []
            );
            if (onlineUsers.has(receiverId)) {
              io.to(receiverId?.toString()).emit(
                "chatMessages",
                chat?.messages || []
              );
            }
          } else {
            socket.emit("error", { message: i18next.t("chatNotFound") });
          }
        } else {
          socket.emit("error", { message: i18next.t("invalidChatId") });
        }
      }
    );

    //isTyping
    socket.on("isTyping", ({ state, receiver }) => {
      console.log("isTyping");

      io.to(receiver.toString()).emit("isTyping", { isTyping: state });
    });

    ////////////////////////////////////////////////////////////////////////////

    //newGroupMessage
    socket.on("newGroupMessage", async ({ message, groupId }) => {
      console.log("newGroupMessage");

      let group = await Group.findById(groupId);
      if (group) {
        let msg = new Message({
          ...message,
        });
        const savedMessage = await msg.save();
        group = await Group.findByIdAndUpdate(
          groupId,
          { $push: { messages: savedMessage?._id?.toString() } },
          { new: true }
        ).populate({
          path: "messages",
          populate: [
            {
              path: "sender",
              model: "Users",
              select: "name email _id avatar rgb",
            },
            {
              path: "emojis",
              model: "Emojis",
            },
          ],
          model: "Messages",
        });
      }
      const { _id, rgb, messages, avatar, createdAt, name } = group;
      // getting new group messages
      io.to(group?._id?.toString()).emit("groupMessages", messages || []);
      // getting new group chat
      io.to(currentUser?._id?.toString()).emit(
        "updatedGroup",
        {
          _id,
          createdAt,
          name,
          rgb,
          avatar,
          lastMessage: messages?.[messages?.length - 1],
          unSeen: 0,
        } || null
      );
      socket.to(group?._id?.toString()).emit(
        "updatedGroup",
        {
          _id,
          createdAt,
          name,
          rgb,
          avatar,
          lastMessage: messages?.[messages?.length - 1],
          unSeen: messages?.reduce((pre, cur) => {
            if (
              cur?.sender?._id?.toString() == currentUser?._id?.toString() &&
              cur?.seen === false
            ) {
              return pre + 1;
            }
            return 0;
          }, 0),
        } || null
      );
      socket.to(group?._id?.toString()).emit(
        "newMessage",
        {
          sender: { _id, name, rgb, avatar },
        } || null
      );
    });

    //joinGroup
    socket.on("joinGroup", async (groupId) => {
      console.log("joinGroup");

      const group = await Group.findById(groupId);
      if (!group?.members?.includes(currentUser?._id?.toString())) {
        // await Group.updateOne({
        //   _id: group?._id,
        //   $push: { members: currentUser?._id?.toString() },
        // });

        group?.members.push(currentUser?._id?.toString());
        await group.save();

        // Join the group room
        socket.join(group?._id?.toString());
        console.log(
          ` ${currentUser?.name} joined to : `,
          group?._id?.toString()
        );
      }
    });

    //newGroup
    socket.on("newGroup", async (group) => {
      console.log("newGroup");

      let newGroup = new Group({
        ...group,
      });
      newGroup = await newGroup.save();
      newGroup = await Group.findById(newGroup?._id);
      // join to this group
      socket.join(newGroup?._id?.toString());
      socket.emit("newGroup", newGroup);
    });

    //groupMessagePage
    socket.on("groupMessagePage", async (groupId) => {
      console.log("groupMessagePage");

      if (mongoose.Types.ObjectId.isValid(groupId?.toString())) {
        const group = await Group.findById(groupId?.toString())
          .select("-admin")
          .populate({
            path: "messages",
            populate: [
              {
                path: "sender",
                model: "Users",
                select: "name email _id avatar rgb",
              },
              {
                path: "emojis",
                model: "Emojis",
              },
            ],
            model: "Messages",
          })
          .populate({
            path: "members",
            model: "Users",
            select: "name email _id avatar rgb",
          });

        if (group) {
          io.to(groupId).emit("groupMessagePage", {
            group,
            messages: group?.messages || [],
          });
        } else {
          socket.emit("error", { message: i18next.t("groupNotFound") });
        }
      } else {
        socket.emit("error", { message: i18next.t("invalidGroupId") });
      }
    });

    //getMyGroups
    socket.on("getMyGroups", async () => {
      console.log("getMyGroups");

      const groupsList = await getUserGroups(currentUser?._id);
      socket.emit("getMyGroups", groupsList);
    });

    //updateGroupMessageEmoji
    socket.on("updateGroupMessageEmoji", async ({ emoji, msgId, groupId }) => {
      console.log("updateGroupMessageEmoji");

      if (
        mongoose.Types.ObjectId.isValid(msgId?.toString()) &&
        mongoose.Types.ObjectId.isValid(groupId?.toString())
      ) {
        // getting group
        let group = await Group.findById(groupId);
        const groupMessages = group?.messages || [];

        // finding message to update its emoji
        const messageToUpdate = await Message.findOne({
          $and: [{ _id: { $in: groupMessages } }, { _id: msgId }],
        });

        // if no emojis
        if (messageToUpdate?.emojis?.length === 0) {
          // first one
          const emoji1 = new Emoji({ ...emoji });
          await emoji1.save();
          await Message.updateOne(
            { _id: messageToUpdate?._id },
            {
              $push: { emojis: emoji1 },
            }
          );
        }
        // if there are an existing emojis
        else {
          let emoji1 = await Emoji.findOne({
            $and: [
              { value: emoji?.value },
              { maker: emoji?.maker },
              { message: emoji?.message },
            ],
          });
          let emoji2 = await Emoji.findOne({
            $and: [
              { value: { $ne: emoji?.value } },
              { maker: emoji?.maker },
              { message: emoji?.message },
            ],
          });

          if (emoji1) {
            await Emoji.deleteOne({ _id: emoji1?._id });
            await Message.updateOne(
              { _id: messageToUpdate?._id },
              {
                $pull: { emojis: emoji1?._id },
              }
            );
          } else if (emoji2) {
            await Emoji.deleteOne({ _id: emoji2?._id });
            await Message.updateOne(
              { _id: messageToUpdate?._id },
              {
                $pull: { emojis: emoji2?._id },
              }
            );
            const emoji1 = new Emoji({ ...emoji });
            await emoji1.save();
            await Message.updateOne(
              { _id: messageToUpdate?._id },
              {
                $push: { emojis: emoji1 },
              }
            );
          } else {
            const emoji1 = new Emoji({ ...emoji });
            await emoji1.save();
            await Message.updateOne(
              { _id: messageToUpdate?._id },
              {
                $push: { emojis: emoji1 },
              }
            );
          }
        }

        // getting group after updating message emoji
        group = await Group.findById(group?._id).populate({
          path: "messages",
          populate: [
            {
              path: "sender",
              model: "Users",
              select: "name email _id avatar rgb",
            },
            {
              path: "emojis",
              model: "Emojis",
            },
          ],
          model: "Messages",
        });

        // sending updated group
        if (group) {
          io.to(groupId?.toString()).emit(
            "groupMessages",
            group?.messages || []
          );
        } else {
          socket.emit("error", { message: i18next.t("groupNotFound") });
        }
      } else {
        socket.emit("error", { message: i18next.t("invalidGroupId") });
      }
    });

    //groupMessageSeen
    socket.on("groupMessageSeen", async (groupId) => {
      console.log("groupMessageSeen");

      if (mongoose.Types.ObjectId.isValid(groupId?.toString())) {
        let group = await Group.findById(groupId);
        const groupMessages = group?.messages || [];

        const results = await Message.updateMany(
          {
            _id: { $in: groupMessages },
            sender: { $ne: currentUser?._id?.toString() },
          },
          {
            $set: {
              seen: true,
            },
          }
        );
        group = await Group.findById(group?._id).populate({
          path: "messages",
          populate: [
            {
              path: "sender",
              model: "Users",
              select: "name email _id avatar rgb",
            },
            {
              path: "emojis",
              model: "Emojis",
            },
          ],
          model: "Messages",
        });

        if (group) {
          // sending updated group
          io.to(currentUser?._id?.toString()).emit(
            "updatedGroup",
            {
              // ...group,
              ...group._doc,
              lastMessage: group?.messages?.[group?.messages?.length - 1],
              unSeen: 0,
            } || null
          );
          if (results?.modifiedCount > 0) {
            io.to(groupId?.toString()).emit(
              "groupMessages",
              group?.messages || []
            );
          }
        } else {
          socket.emit("error", { message: i18next.t("groupNotFound") });
        }
      } else {
        socket.emit("error", { message: i18next.t("invalidGroupId") });
      }
    });

    // search
    socket.on("search", async (keyword) => {
      console.log("search");

      // users
      const users = await User.find({
        $or: [
          {
            name: { $regex: keyword, $options: "i" },
          },
          {
            email: { $regex: keyword, $options: "i" },
          },
        ],
        $nor: [{ name: currentUser?.name }, { email: currentUser?.email }],
      });
      // users count
      const usersTotalCount = await User.find({
        $or: [
          {
            name: { $regex: keyword, $options: "i" },
          },
          {
            email: { $regex: keyword, $options: "i" },
          },
        ],
        $nor: [{ name: currentUser?.name }, { email: currentUser?.email }],
      }).countDocuments();
      // groups;
      const groups = await Group.find({
        name: { $regex: keyword, $options: "i" },
      });
      // groups count
      const groupsTotalCount = await Group.find({
        name: { $regex: keyword, $options: "i" },
      }).countDocuments();

      if (users.length === 0 && groups.length === 0) {
        socket.emit("searchResults", { message: "Not found." });
      } else {
        socket.emit("searchResults", {
          // message: "This is the search results.",
          data: {
            users,
            usersTotalCount,
            groups,
            groupsTotalCount,
          },
        });
      }
    });

    // ////////////////////////////////////////////////////////////////////

    // Handle call invitation
    socket.on("callUser", ({ callerId, receiverId, signal }) => {
      if (onlineUsers.has(callerId.toString())) {
        io.to(receiverId.toString()).emit("receiveCall", { callerId, signal });
      } else {
        console.log("Receiver not online");
      }
    });

    // Handle call answer
    socket.on("answerCall", ({ callerId, signal }) => {
      io.to(callerId.toString()).emit("callAnswered", { signal });
    });

    // Handle ICE candidates
    socket.on("iceCandidate", ({ userId, candidate }) => {
      if (onlineUsers.has(userId.toString())) {
        io.to(userId.toString()).emit("iceCandidate", { candidate });
      }
    });

    // ////////////////////////////////////////////////////////////////////

    // disconnect
    socket.on("disconnect", async () => {
      console.log("disconnect");

      // disconnect message
      console.log(`${currentUser?.name} disconnected`);
      disconnected(currentUser, onlineUsers, onlineUsersData);
      const last_seen = new Date().toLocaleString();
      await User.updateOne({ _id: currentUser?._id }, { $set: { last_seen } });
      // update online users
      io.emit("onlineUsers", Array.from(onlineUsers));
      io.emit("onlineUsersData", onlineUsersData);
      io.emit("lastSeen", last_seen);
    });
  });
}

async function getUserChats(userId) {
  const Chats = await Chat.find({
    $or: [{ sender: userId?.toString() }, { receiver: userId?.toString() }],
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "messages",
      populate: [
        {
          path: "sender",
          model: "Users",
          select: "name email _id avatar rgb",
        },
        {
          path: "emojis",
          model: "Emojis",
        },
      ],
      model: "Messages",
    })
    .populate({
      path: "sender",
      model: "Users",
      select: "name email _id avatar rgb",
    })
    .populate({
      path: "receiver",
      model: "Users",
      select: "name email _id avatar rgb",
    });
  const ChatsList = Chats.map(
    ({ sender, receiver, messages, _id, createdAt }) => {
      return {
        sender,
        receiver,
        messages,
        _id,
        createdAt,
        lastMessage: messages?.[messages?.length - 1],
        unSeen: messages?.reduce((pre, cur) => {
          if (
            cur?.sender?._id?.toString() !== userId?.toString() &&
            cur?.seen === false
          ) {
            return pre + 1;
          }
          return 0;
        }, 0),
      };
    }
  );
  return ChatsList;
}

async function getUserGroups(userId) {
  const groups = await Group.find({
    members: userId?.toString(),
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "messages",
      populate: [
        {
          path: "sender",
          model: "Users",
          select: "name email _id avatar rgb",
        },
        {
          path: "emojis",
          model: "Emojis",
        },
      ],
      model: "Messages",
    });

  const groupsList = groups?.map(
    ({ messages, name, createdAt, avatar, _id, rgb }) => {
      return {
        name,
        createdAt,
        avatar,
        _id,
        rgb,
        lastMessage: messages?.[messages?.length - 1],
        unSeen: messages?.reduce((pre, cur) => {
          if (
            cur?.sender?._id?.toString() !== userId?.toString() &&
            cur?.seen === false
          ) {
            return pre + 1;
          }
          return 0;
        }, 0),
      };
    }
  );
  return groupsList;
}

function connected(user, onlineUsers, onlineUsersData) {
  onlineUsers.add(user?._id?.toString());
  const index = onlineUsersData.findIndex(
    (u) => u?._id?.toString() === user?._id?.toString()
  );
  if (index === -1) {
    onlineUsersData.push({
      _id: user?._id,
      name: user?.name,
      avatar: user?.avatar,
      rgb: user?.rgb,
    });
  }
}

function disconnected(user, onlineUsers, onlineUsersData) {
  onlineUsers.delete(user?._id?.toString());
  const index = onlineUsersData.findIndex(
    (item) => item._id.toString() === user?._id.toString()
  );
  if (index !== -1) {
    onlineUsersData.splice(index, 1);
  }
}

*/
