//messages collection controllers

const mongoose = require('mongoose');
const messages = mongoose.model('message');

//Create new message (accepts senderId from body or session)
const messagesCreate = async (req, res) => {
    try {
        const { senderId, senderName, receiverId, receiverName, subject, messageText, itemId, itemTitle, messageType } = req.body;
        
        // Validate required fields
        const errors = [];
        if (!senderId || typeof Number(senderId) !== 'number') errors.push('senderId requerido');
        if (!receiverId) errors.push('receiverId requerido');
        if (!receiverName) errors.push('receiverName requerido');
        if (!subject) errors.push('subject requerido');
        if (!messageText || String(messageText).trim().length < 1) errors.push('messageText requerido');
        if (errors.length) return res.status(400).json({ status: 'error', message: errors.join('. ') });

        // Get sender name from session or body
        const sessionUser = req.session && req.session.user;
        const finalSenderId = sessionUser?.userid || Number(senderId);
        const fullSenderName = sessionUser?.name || senderName || 'Usuario';
        const finalSenderName = fullSenderName.split(' ')[0]; // Use first name only

        // Generate incremental messageId
        const Message = mongoose.model('message');
        const maxM = await Message.findOne({}, {}, { sort: { messageId: -1 } });
        const nextId = maxM ? maxM.messageId + 1 : 3001;

        // Simple deterministic conversationId by participant ids
        const a = Math.min(finalSenderId, Number(receiverId));
        const b = Math.max(finalSenderId, Number(receiverId));
        const conversationId = `${a}-${b}`;

        const msg = new Message({
            messageId: nextId,
            conversationId,
            senderId: finalSenderId,
            senderName: finalSenderName,
            receiverId: Number(receiverId),
            receiverName,
            itemId: itemId ? Number(itemId) : undefined,
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

//Messages list - returns messages where user is sender or receiver
const messagesList = async (req, res) => {
    try {
        // SECURITY: Only use session user, ignore query params to prevent unauthorized access
        const sessionUser = req.session && req.session.user;
        
        if (!sessionUser || typeof sessionUser.userid !== 'number') {
            return res.status(401).json({ status: 'error', message: 'Debes iniciar sesión.' });
        }
        
        const userId = sessionUser.userid;

        const { limit: limitRaw, skip: skipRaw, unreadOnly } = req.query;
        const limit = Number.parseInt(limitRaw) || 50;
        const skip = Number.parseInt(skipRaw) || 0;

        const filter = {
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        };

        if (unreadOnly === 'true') {
            filter.isRead = false;
            filter.receiverId = userId; // unread only applies to received messages
        }

        const [msgs, total] = await Promise.all([
            messages.find(filter).sort({ created: -1 }).skip(skip).limit(limit).lean(),
            messages.countDocuments(filter)
        ]);

        return res.status(200).json({
            status: 'success',
            total,
            count: msgs.length,
            messages: msgs
        });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Error al listar mensajes.', error: err.message });
    }
}

//Read one message - only sender or receiver can access, mark as read if receiver
const messagesReadOne = async (req, res) => {
    try {
        const sessionUser = req.session && req.session.user;
        if (!sessionUser || typeof sessionUser.userid !== 'number') {
            return res.status(401).json({ status: 'error', message: 'Debes iniciar sesión.' });
        }

        const messageId = req.params.messageId;
        const msg = await messages.findById(messageId).lean();

        if (!msg) {
            return res.status(404).json({ status: 'error', message: 'Mensaje no encontrado.' });
        }

        // Access control: only sender or receiver can view
        if (msg.senderId !== sessionUser.userid && msg.receiverId !== sessionUser.userid) {
            return res.status(403).json({ status: 'error', message: 'No tienes permiso para ver este mensaje.' });
        }

        // Mark as read if user is the receiver and message is unread
        if (msg.receiverId === sessionUser.userid && !msg.isRead) {
            await messages.findByIdAndUpdate(messageId, { isRead: true });
            msg.isRead = true; // update local copy
        }

        return res.status(200).json({ status: 'success', message: msg });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ status: 'error', message: 'ID de mensaje inválido.' });
        }
        return res.status(500).json({ status: 'error', message: 'Error al buscar mensaje.', error: err.message });
    }
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

// Get unread message count for current user
const messagesUnreadCount = async (req, res) => {
    try {
        // SECURITY: Only use session user, not query params
        const sessionUser = req.session && req.session.user;

        if (!sessionUser || typeof sessionUser.userid !== 'number') {
            return res.status(200).json({ status: 'success', count: 0 }); // return 0 if not logged in
        }
        
        const userId = sessionUser.userid;

        const count = await messages.countDocuments({
            receiverId: userId,
            isRead: false
        });

        return res.status(200).json({ status: 'success', count });
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Error al contar mensajes.', error: err.message });
    }
};

module.exports = {
    messagesCreate,
    messagesList,
    messagesReadOne,
    messagesUpdateOne,
    messagesDeleteOne,
    messagesUnreadCount,
}