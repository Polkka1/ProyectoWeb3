const axios = require('axios');

// GET new message form
const newMessageGet = async (req, res, next) => {
  const { sellerId, itemId } = req.query;
  
  // Optionally fetch item details to pre-fill context
  let item = null;
  if (itemId) {
    try {
      const apiUrl = `${req.protocol}://${req.get('host')}/api/items/${itemId}`;
      const response = await axios.get(apiUrl);
      item = response.data.item || response.data;
    } catch (err) {
      console.error('Error fetching item for message context:', err.message);
    }
  }

  res.render('messages/new', {
    title: 'Enviar Mensaje - CampuSwap',
    error: null,
    success: null,
    sellerId,
    item,
    formData: {}
  });
};

// POST send new message
const newMessagePost = async (req, res, next) => {
  const { receiverId, itemId, subject, body } = req.body;
  const senderId = req.session?.user?.userid;

  if (!senderId) {
    return res.status(401).render('messages/new', {
      title: 'Enviar Mensaje - CampuSwap',
      error: 'Debes iniciar sesión para enviar mensajes.',
      success: null,
      sellerId: receiverId,
      item: null,
      formData: { subject, body }
    });
  }

  if (!receiverId || !subject || !body) {
    return res.render('messages/new', {
      title: 'Enviar Mensaje - CampuSwap',
      error: 'Completa todos los campos requeridos.',
      success: null,
      sellerId: receiverId,
      item: null,
      formData: { subject, body }
    });
  }

  const apiUrl = `${req.protocol}://${req.get('host')}/api/messages`;
  
  // Fetch receiver name from item seller info or users API
  let receiverName = null;
  let itemTitle = null;
  
  if (itemId) {
    try {
      const itemResponse = await axios.get(`${req.protocol}://${req.get('host')}/api/items/${itemId}`);
      const item = itemResponse.data.item || itemResponse.data;
      receiverName = item.seller?.name || item.sellerName;
      itemTitle = item.title;
    } catch (err) {
      console.error('Error fetching item for message:', err.message);
    }
  }
  
  // If still no receiver name, fetch from users API
  if (!receiverName && receiverId) {
    try {
      const usersResponse = await axios.get(`${req.protocol}://${req.get('host')}/api/users`, {
        headers: { Cookie: req.headers.cookie || '' }
      });
      const users = usersResponse.data.users || [];
      const receiver = users.find(u => u.userid === Number(receiverId));
      receiverName = receiver?.name;
    } catch (err) {
      console.error('Error fetching receiver name:', err.message);
    }
  }
  
  // Final fallback
  if (!receiverName) {
    receiverName = 'Usuario';
  }

  try {
    // Extract first names only
    const senderFirstName = req.session.user.name.split(' ')[0];
    const receiverFirstName = receiverName ? receiverName.split(' ')[0] : 'Usuario';
    
    await axios.post(apiUrl, {
      senderId,
      senderName: senderFirstName,
      receiverId: Number(receiverId),
      receiverName: receiverFirstName,
      subject,
      messageText: body,
      itemId: itemId ? Number(itemId) : undefined,
      itemTitle
    });

    return res.render('messages/new', {
      title: 'Enviar Mensaje - CampuSwap',
      error: null,
      success: 'Mensaje enviado exitosamente. El vendedor recibirá tu consulta.',
      sellerId: null,
      item: null,
      formData: {}
    });
  } catch (err) {
    console.error('Error sending message:', err.message);
    const errorMessage = err.response?.data?.message || 'No se pudo enviar el mensaje. Intenta de nuevo.';
    return res.render('messages/new', {
      title: 'Enviar Mensaje - CampuSwap',
      error: errorMessage,
      success: null,
      sellerId: receiverId,
      item: null,
      formData: { subject, body }
    });
  }
};

// GET messages list (inbox)
const messagesList = async (req, res, next) => {
  const userId = req.session?.user?.userid;
  
  if (!userId) {
    return res.redirect('/auth/login?next=/messages');
  }

  const apiUrl = `${req.protocol}://${req.get('host')}/api/messages`;
  try {
    // Forward session cookie to API for authentication
    const response = await axios.get(apiUrl, {
      headers: {
        Cookie: req.headers.cookie || ''
      }
    });
    const data = response.data;
    const msgs = data.messages || [];

    // Group by conversation and show most recent per conversation
    const conversations = {};
    msgs.forEach(msg => {
      const convId = msg.conversationId;
      if (!conversations[convId] || new Date(msg.created) > new Date(conversations[convId].created)) {
        conversations[convId] = msg;
      }
    });

    const conversationList = Object.values(conversations).sort((a, b) => 
      new Date(b.created) - new Date(a.created)
    );

    res.render('messages/list', {
      title: 'Mis Mensajes - CampuSwap',
      conversations: conversationList,
      userId,
      error: null
    });
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    res.render('messages/list', {
      title: 'Mis Mensajes - CampuSwap',
      conversations: [],
      userId,
      error: 'No se pudieron cargar los mensajes.'
    });
  }
};

// GET conversation detail - show all messages in thread
const conversationDetail = async (req, res, next) => {
  const userId = req.session?.user?.userid;
  const conversationId = req.params.conversationId;
  
  if (!userId) {
    return res.redirect('/auth/login?next=/messages');
  }

  const apiUrl = `${req.protocol}://${req.get('host')}/api/messages`;
  try {
    // Forward session cookie to API for authentication
    const response = await axios.get(apiUrl, {
      headers: {
        Cookie: req.headers.cookie || ''
      }
    });
    const data = response.data;
    const allMsgs = data.messages || [];

    // Filter messages for this conversation
    const conversationMsgs = allMsgs.filter(msg => msg.conversationId === conversationId);
    
    if (conversationMsgs.length === 0) {
      return res.status(404).render('error', {
        title: 'Conversación no encontrada',
        message: 'No se encontró esta conversación o no tienes acceso a ella.',
        error: { status: 404 }
      });
    }

    // SECURITY: Double-check user is a participant in this conversation
    // (API already filters by user, but this is an extra safety check)
    const isParticipant = conversationMsgs.some(msg => 
      msg.senderId === userId || msg.receiverId === userId
    );
    
    if (!isParticipant) {
      return res.status(403).render('error', {
        title: 'Acceso denegado',
        message: 'No tienes permiso para ver esta conversación.',
        error: { status: 403 }
      });
    }

    // Sort by date (oldest first for chat view)
    conversationMsgs.sort((a, b) => new Date(a.created) - new Date(b.created));

    // Get other participant info from first message
    const firstMsg = conversationMsgs[0];
    const isReceiver = firstMsg.receiverId === userId;
    const otherPartyId = isReceiver ? firstMsg.senderId : firstMsg.receiverId;
    let otherPartyName = isReceiver ? firstMsg.senderName : firstMsg.receiverName;
    
    // If name is "Usuario", try to fetch real name from users API
    if (!otherPartyName || otherPartyName === 'Usuario') {
      try {
        const usersResponse = await axios.get(`${req.protocol}://${req.get('host')}/api/users`, {
          headers: { Cookie: req.headers.cookie || '' }
        });
        const users = usersResponse.data.users || [];
        const otherUser = users.find(u => u.userid === otherPartyId);
        if (otherUser && otherUser.name) {
          otherPartyName = otherUser.name.split(' ')[0]; // First name only
        }
      } catch (err) {
        console.error('Error fetching other party name:', err.message);
      }
    }
    
    const otherParty = {
      id: otherPartyId,
      name: otherPartyName || 'Usuario'
    };

    res.render('messages/conversation', {
      title: `Conversación con ${otherParty.name} - CampuSwap`,
      messages: conversationMsgs,
      otherParty,
      userId,
      conversationId,
      error: null
    });
  } catch (err) {
    console.error('Error fetching conversation:', err.message);
    return res.status(500).render('error', {
      title: 'Error',
      message: 'No se pudo cargar la conversación.',
      error: { status: 500 }
    });
  }
};

module.exports = {
  newMessageGet,
  newMessagePost,
  messagesList,
  conversationDetail
};
