//messages collection controllers

const mongoose = require('mongoose');
const messages = mongoose.model('message');

//Create new message (link sender to session user)
const messagesCreate = async (req, res) => {
    try {
        const sessionUser = req.session && req.session.user;
        if (!sessionUser || typeof sessionUser.userid !== 'number') {
            return res.status(401).json({ status: 'error', message: 'Debes iniciar sesión para enviar mensajes.' });
        }
        const { receiverId, receiverName, subject, messageText, itemId, itemTitle, messageType } = req.body;
        const errors = [];
        if (!receiverId) errors.push('receiverId requerido');
        if (!receiverName) errors.push('receiverName requerido');
        if (!subject) errors.push('subject requerido');
        if (!messageText || String(messageText).trim().length < 1) errors.push('messageText requerido');
        if (errors.length) return res.status(400).json({ status: 'error', message: errors.join('. ') });

        // Generate incremental messageId
        const Message = mongoose.model('message');
        const maxM = await Message.findOne({}, {}, { sort: { messageId: -1 } });
        const nextId = maxM ? maxM.messageId + 1 : 3001;

        // Simple deterministic conversationId by participant ids
        const a = Math.min(sessionUser.userid, Number(receiverId));
        const b = Math.max(sessionUser.userid, Number(receiverId));
        const conversationId = `${a}-${b}`;

        const msg = new Message({
            messageId: nextId,
            conversationId,
            senderId: sessionUser.userid,
            senderName: sessionUser.name,
            receiverId,
            receiverName,
            itemId,
            itemTitle,
            subject: String(subject).trim(),
            messageText: String(messageText).trim(),
            messageType: messageType || 'general'
        });
        await msg.save();
        return res.status(201).json({ status: 'success', message: 'Mensaje enviado', data: msg });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Error al enviar mensaje.', error: err.message });
    }
}

//Messages list
const messagesList = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success messagesList",
    })
}

//Read one message
const messagesReadOne = (req, res) => {
    messages
        .findById(req.params.messageId)
        .exec((err, messageObject) => {
            console.log("findById success");
        });
}

//Update message
const messagesUpdateOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success messagesUpdateOne",
    })
}

//Delete message
const messagesDeleteOne = (req, res) => {
    res
    .status(200)
    .json({
        "status": "success messagesDeleteOne",
    })
}

module.exports = {
    messagesCreate,
    messagesList,
    messagesReadOne,
    messagesUpdateOne,
    messagesDeleteOne,
}