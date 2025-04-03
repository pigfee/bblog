// 将所有DOM操作和事件监听放在DOMContentLoaded事件中
document.addEventListener('DOMContentLoaded', () => {
    // 初始化AOS动画库
    AOS.init({
        duration: 1000,
        once: true
    });

    // 获取DOM元素
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const aiSidebar = document.getElementById('aiSidebar');
    const sidebarHeader = document.getElementById('sidebarHeader');
    const aiBtn = document.querySelector('.ai-btn');
    const aiFloatButton = document.getElementById('aiFloatButton');
    const chatMessages = document.querySelector('.messages');
    const messageInput = document.querySelector('.input-area textarea');
    const sendButton = document.querySelector('.send-message');
    const backToTop = document.getElementById('backToTop');

    // 导航栏响应式菜单
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // AI侧边栏控制
    aiFloatButton.addEventListener('click', () => {
        aiSidebar.classList.add('active');
    });

    sidebarHeader.addEventListener('click', () => {
        aiSidebar.classList.remove('active');
    });

    aiBtn.addEventListener('click', () => {
        aiSidebar.classList.add('active');
    });

    // 点击外部关闭
    document.addEventListener('click', (e) => {
        if (aiSidebar.classList.contains('active') && 
            !aiSidebar.contains(e.target) && 
            !e.target.closest('.ai-btn') &&
            !e.target.closest('.ai-float-button')) {
            aiSidebar.classList.remove('active');
        }
    });

    // 返回顶部按钮
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.style.display = 'block';
        } else {
            backToTop.style.display = 'none';
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // AI配置
    const AI_CONFIG = {
        apiKey: 'sk-saozwageanhxokqqxgzfqbjtehxulfztdiwdkpzteeqbnevp',
        apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
        model: 'Qwen/Qwen2.5-7B-Instruct'
    };

    // 存储对话历史
    let conversationHistory = [];

    // AI对话功能
    async function sendToAI(message) {
        try {
            const response = await fetch(AI_CONFIG.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AI_CONFIG.apiKey}`
                },
                body: JSON.stringify({
                    model: AI_CONFIG.model,
                    messages: [
                        ...conversationHistory,
                        { role: 'user', content: message }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error('API请求失败');
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            
            conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: aiResponse }
            );
            
            return aiResponse;
        } catch (error) {
            console.error('AI响应错误:', error);
            return '抱歉，我现在无法回答。请稍后再试。';
        }
    }

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-content';
        textDiv.textContent = content;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(textDiv);
        chatMessages.appendChild(messageDiv);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message loading';
        loadingDiv.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return loadingDiv;
    }

    async function handleSendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        messageInput.disabled = true;
        sendButton.disabled = true;

        addMessage(message, true);
        messageInput.value = '';

        const loadingIndicator = showLoadingIndicator();

        try {
            const aiResponse = await sendToAI(message);
            loadingIndicator.remove();
            addMessage(aiResponse, false);
        } catch (error) {
            loadingIndicator.remove();
            addMessage('抱歉，发生了错误。请稍后再试。', false);
        } finally {
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.focus();
        }
    }

    // 添加发送消息的事件监听
    sendButton.addEventListener('click', handleSendMessage);

    // 添加回车发送功能
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
}); 
