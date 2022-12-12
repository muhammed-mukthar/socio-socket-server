const dotenv=require('dotenv')
dotenv.config()
console.log(process.env.CORS_VARS.split(", "));

const io=require('socket.io')(8800,{
    cors:{
        origin:process.env.CORS_VARS.split(", "),
        methods: "GET,PUT,POST,DELETE"
      
    }
})

let activeUsers=[]
console.log(activeUsers,"activeUsers");
io.on('connection',(socket)=>{
//add new User
console.log('i am here');
socket.on('new-user-add',(newUserId)=>{
    if(!activeUsers.some((user)=>user.userId ===newUserId)){
        activeUsers.push({
            userId:newUserId,
            socketId:socket.id
        })
    }
    console.log('connected users',activeUsers);
    io.emit('get-users',activeUsers)
})

//send Message

  socket.on("send-message", (data) => {
    console.log(activeUsers,"activeUsers");
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit("recieve-message", data);
    }
  });


  const getUser = (userId) => {
    return activeUsers.find((user) => user.userId === userId);
  };



//sendtext
  socket.on("sendText", ({ senderName, receiverName, text }) => {
    const receiver = getUser(receiverName);
    io.to(receiver.socketId).emit("getText", {
      senderName,
      text,
    });
  });

   // notifications

  // SEND NOTIFICATION 
  socket.on("send-notification",(data)=>{
    console.log(data,'is it ccoming from');
    const {recieverId,senderId,desc} = data
    const reciever = activeUsers.find((user)=>user.userId === recieverId)
    console.log(reciever,'noti reciever'); 
    io.to(reciever?.socketId).emit("getNotification",{ 
        senderId,
        desc,
    }) 
})
//when disconnect

socket.on('disconnect',()=>{
  console.log(activeUsers,"activeUsers");
   activeUsers= activeUsers.filter((user)=> user.socketId != socket.id)
   console.log('user Disconnected',activeUsers);
   io.emit('get-users',activeUsers)
})


})