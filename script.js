// 初始化AOS动画库
AOS.init({
    duration: 1000,
    once: true
});

// 导航栏响应式菜单
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// 修改AI对话相关代码
const aiSidebar = document.getElementById('aiSidebar');
const sidebarHeader = document.getElementById('sidebarHeader');
const openAiChat = document.querySelector('.open-ai-chat');
const aiBtn = document.querySelector('.ai-btn');
const aiFloatButton = document.getElementById('aiFloatButton');

// 点击浮动按钮打开侧边栏
aiFloatButton.addEventListener('click', () => {
    aiSidebar.classList.add('active');
});

// 点击header关闭侧边栏
sidebarHeader.addEventListener('click', () => {
    aiSidebar.classList.remove('active');
});

// 点击其他打开按钮
openAiChat.addEventListener('click', () => {
    aiSidebar.classList.add('active');
});

aiBtn.addEventListener('click', () => {
    aiSidebar.classList.add('active');
});

// 点击外部关闭
document.addEventListener('click', (e) => {
    if (aiSidebar.classList.contains('active') && 
        !aiSidebar.contains(e.target) && 
        !e.target.closest('.open-ai-chat') &&
        !e.target.closest('.ai-btn') &&
        !e.target.closest('.ai-float-button')) {
        aiSidebar.classList.remove('active');
    }
});

// 返回顶部按钮
const backToTop = document.getElementById('backToTop');

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

// AI对话功能
const chatMessages = document.querySelector('.messages');
const messageInput = document.querySelector('.input-area textarea');
const sendButton = document.querySelector('.send-message');

// AI配置
const AI_CONFIG = {
    apiKey: 'sk-saozwageanhxokqqxgzfqbjtehxulfztdiwdkpzteeqbnevp',
    apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
    model: 'Qwen/Qwen2.5-7B-Instruct'
};

// 存储对话历史
let conversationHistory = [];

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
        
        // 更新对话历史
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
    
    // 自动滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 添加加载动画
function showLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message loading';
    loadingDiv.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingDiv;
}

sendButton.addEventListener('click', async () => {
    const message = messageInput.value.trim();
    if (message) {
        // 禁用输入和发送按钮
        messageInput.disabled = true;
        sendButton.disabled = true;
        
        // 显示用户消息
        addMessage(message, true);
        messageInput.value = '';
        
        // 显示加载动画
        const loadingIndicator = showLoadingIndicator();
        
        try {
            // 发送到AI并获取响应
            const aiResponse = await sendToAI(message);
            
            // 移除加载动画
            loadingIndicator.remove();
            
            // 显示AI响应
            addMessage(aiResponse, false);
        } catch (error) {
            // 移除加载动画
            loadingIndicator.remove();
            
            // 显示错误消息
            addMessage('抱歉，发生了错误。请稍后再试。', false);
        } finally {
            // 重新启用输入和发送按钮
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.focus();
        }
    }
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
    }
});

// 发送消息处理
async function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // 显示用户消息
    addMessage(message, true);
    messageInput.value = '';

    try {
        // 这里替换为你的AI API调用
        const response = await sendToAI(message);
        addMessage(response, false);
    } catch (error) {
        addMessage('抱歉，出现了一些错误，请稍后再试。', false);
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