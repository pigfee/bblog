// 将所有DOM操作和事件监听放在DOMContentLoaded事件中
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const aiSidebar = document.getElementById('aiSidebar');
    const sidebarHeader = document.querySelector('.sidebar-header');
    const aiFloatButton = document.querySelector('.ai-float-button');
    const messagesContainer = document.querySelector('.messages');
    const messageInput = document.querySelector('.input-area textarea');
    const sendButton = document.querySelector('.send-message');
    const modelSelect = document.querySelector('.model-select');

    // AI侧边栏控制
    aiFloatButton.addEventListener('click', () => {
        aiSidebar.style.left = '0';
    });

    // 点击header关闭侧边栏（排除模型选择器）
    sidebarHeader.addEventListener('click', (e) => {
        if (!modelSelect.contains(e.target)) {
            aiSidebar.style.left = '-300px';
        }
    });

    // 点击外部关闭侧边栏
    document.addEventListener('click', (e) => {
        if (aiSidebar.style.left === '0px' && 
            !aiSidebar.contains(e.target) && 
            !aiFloatButton.contains(e.target)) {
            aiSidebar.style.left = '-300px';
        }
    });

    // 阻止模型选择器的点击事件冒泡
    modelSelect.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // AI配置
    const AI_CONFIG = {
        apiKey: 'sk-saozwageanhxokqqxgzfqbjtehxulfztdiwdkpzteeqbnevp',
        apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
        model: 'Qwen/Qwen2.5-7B-Instruct'
    };

    // 存储对话历史
    let conversationHistory = [];

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
        messagesContainer.appendChild(messageDiv);
        
        // 自动滚动到底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message loading';
        loadingDiv.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
            // 获取当前选择的模型
            const selectedModel = modelSelect.value;
            
            const response = await fetch(AI_CONFIG.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AI_CONFIG.apiKey}`
                },
                body: JSON.stringify({
                    model: selectedModel,
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
            
            loadingIndicator.remove();
            addMessage(aiResponse, false);
            
            // 更新对话历史
            conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: aiResponse }
            );
        } catch (error) {
            loadingIndicator.remove();
            addMessage('抱歉，发生了错误。请稍后再试。', false);
            console.error('AI响应错误:', error);
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
