/**
 * 水滴小助手 - 喝水打卡应用
 * 小朋友友好风格 + 丰富动画 + 贴纸收集 + 成就徽章 + 日历视图系统
 */

// 数据存储键名
const STORAGE_KEY = 'ruthirsty_records';
const STICKERS_KEY = 'ruthirsty_stickers';
const BADGES_KEY = 'ruthirsty_badges';
const STREAK_KEY = 'ruthirsty_streak';

// 当天日期
let currentDate = '';

// 每日目标打卡次数（动态，根据天气调整）
let dailyGoal = 8;

// 上一次的打卡次数，用于判断是否需要弹跳动画
let previousCount = 0;

// 当前连续天数
let currentStreak = 0;

// 日历当前显示的月份和年份
let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth();

// 当前天气数据
let currentWeather = null;

// 天气API配置（使用免费的OpenWeatherMap）
const WEATHER_API_KEY = ''; // 需要用户自行申请API密钥

// 贴纸收集系统配置
const STICKERS = [
    { id: 'apple', emoji: '🍎', name: '苹果', requirement: 1 },
    { id: 'grape', emoji: '🍇', name: '葡萄', requirement: 2 },
    { id: 'orange', emoji: '🍊', name: '橙子', requirement: 4 },
    { id: 'lemon', emoji: '🍋', name: '柠檬', requirement: 6 },
    { id: 'strawberry', emoji: '🍓', name: '草莓', requirement: 8 },
    { id: 'peach', emoji: '🍑', name: '桃子', requirement: 10 },
    { id: 'cherry', emoji: '🍒', name: '樱桃', requirement: 12 },
    { id: 'mango', emoji: '🥭', name: '芒果', requirement: 15 }
];

// 成就徽章系统配置
const BADGES = [
    { id: 'week', emoji: '🌟', name: '坚持一周', days: 7, desc: '连续7天达标' },
    { id: 'halfmonth', emoji: '⭐', name: '半月挑战', days: 15, desc: '连续15天达标' },
    { id: 'tripleweek', emoji: '💎', name: '三周达人', days: 21, desc: '连续21天达标' },
    { id: 'month', emoji: '🏆', name: '月度王者', days: 30, desc: '连续30天达标' }
];

// 已收集的贴纸ID列表
let collectedStickers = [];

// 已获得的成就ID列表
let earnedBadges = [];

// 最后打卡日期
let lastCheckInDate = null;

// 等待设备准备就绪
document.addEventListener('deviceready', onDeviceReady, false);

// 如果不是在Cordova环境中（浏览器测试），直接初始化
if (!window.cordova) {
    document.addEventListener('DOMContentLoaded', onDeviceReady, false);
}

function onDeviceReady() {
    console.log('RUthirsty app initialized');
    console.log('Running on ' + (window.cordova ? cordova.platformId : 'browser'));

    // 初始化日期
    initDate();

    // 加载数据
    loadCollectedStickers();
    loadEarnedBadges();
    loadStreakData();

    // 计算连续天数
    calculateStreak();

    // 绑定打卡按钮事件
    const checkInBtn = document.getElementById('checkInBtn');
    checkInBtn.addEventListener('click', handleCheckIn);

    // 绑定触摸事件以支持更好的移动端体验
    checkInBtn.addEventListener('touchstart', () => {}, { passive: true });

    // 绑定日历导航事件
    document.getElementById('calendarPrev').addEventListener('click', () => {
        calendarMonth--;
        if (calendarMonth < 0) {
            calendarMonth = 11;
            calendarYear--;
        }
        renderCalendar();
    });

    document.getElementById('calendarNext').addEventListener('click', () => {
        calendarMonth++;
        if (calendarMonth > 11) {
            calendarMonth = 0;
            calendarYear++;
        }
        renderCalendar();
    });

    // 绑定日历弹窗关闭事件
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', closeModal);

    // 绑定底部Tab栏切换
    initTabNavigation();

    // 绑定天气刷新按钮
    document.getElementById('weatherRefreshBtn').addEventListener('click', fetchWeather);

    // 启动背景水滴粒子效果
    startWaterDrops();

    // 初始化UI
    initStickersGrid();
    initBadgesGrid();
    updateStreakDisplay();
    renderCalendar();
    updateDailyGoalDisplay();

    // 加载并显示数据
    loadData();

    // 获取天气数据
    fetchWeather();
}

/**
 * 初始化当前日期
 */
function initDate() {
    const now = new Date();
    currentDate = formatDate(now);
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 格式化时间为 HH:mm:ss
 */
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化日期时间用于显示
 */
function formatDateTime(date) {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}${day}日 ${hours}:${minutes}`;
}

/**
 * 渲染日历
 */
function renderCalendar() {
    const container = document.getElementById('calendarDays');
    const monthTitle = document.getElementById('calendarMonth');

    // 更新月份标题
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    monthTitle.textContent = `${calendarYear}年 ${monthNames[calendarMonth]}`;

    // 获取当月第一天是星期几
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();

    // 获取当月有多少天
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    // 获取所有记录
    const records = getAllRecords();

    // 创建日历格子
    let html = '';

    // 添加空白格子（月初前的）
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    // 添加日期格子
    const today = formatDate(new Date());

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayRecords = records.filter(r => r.date === dateStr);
        const count = dayRecords.length;

        // 判断状态
        let statusClass = '';
        let dataAttr = '';

        if (dayRecords.length > 0) {
            if (count >= dailyGoal) {
                statusClass = 'qualified';
            } else {
                statusClass = 'partial';
                dataAttr = `data-count="${count}"`;
            }
        }

        // 判断是否是今天
        const isToday = dateStr === today ? 'today' : '';

        html += `<div class="calendar-day ${statusClass} ${isToday}" ${dataAttr} data-date="${dateStr}">${day}</div>`;
    }

    // 填充剩余格子（保持7列）
    const totalCells = firstDay + daysInMonth;
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) {
        for (let i = 0; i < remainingCells; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
    }

    container.innerHTML = html;

    // 添加点击事件
    container.querySelectorAll('.calendar-day:not(.empty)').forEach(day => {
        day.addEventListener('click', handleDayClick);
    });
}

/**
 * 处理日期点击
 */
function handleDayClick(event) {
    const dateStr = event.target.dataset.date;
    if (!dateStr) return;

    // 震动反馈
    if (navigator.vibrate) {
        navigator.vibrate(20);
    }

    showDayDetails(dateStr);
}

/**
 * 显示日期详情
 */
function showDayDetails(dateStr) {
    const modal = document.getElementById('calendarModal');
    const overlay = document.getElementById('modalOverlay');
    const dateTitle = document.getElementById('modalDateTitle');
    const countElement = document.getElementById('modalCount');
    const qualifiedElement = document.getElementById('modalQualified');
    const recordsContainer = document.getElementById('modalRecords');

    // 获取当天记录
    const records = getAllRecords().filter(r => r.date === dateStr);
    const count = records.length;
    const isQualified = count >= dailyGoal;

    // 解析日期
    const [year, month, day] = dateStr.split('-');
    const displayDate = `${year}年${parseInt(month)}月${parseInt(day)}日`;

    // 更新弹窗内容
    dateTitle.textContent = displayDate;
    countElement.textContent = count;

    if (isQualified) {
        qualifiedElement.textContent = '✓ 已达标';
        qualifiedElement.className = 'modal-stat-badge qualified';
    } else {
        qualifiedElement.textContent = `未达标（需${dailyGoal}次）`;
        qualifiedElement.className = 'modal-stat-badge not-qualified';
    }

    // 生成记录列表
    if (records.length === 0) {
        recordsContainer.innerHTML = '<p class="empty-state"><span class="empty-icon">🐰</span>那天没有喝水记录哦~</p>';
    } else {
        const html = records
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(record => `
                <div class="modal-record-item">
                    <span class="modal-record-time">${record.timeStr}</span>
                    <span class="modal-record-icon">💦</span>
                </div>
            `).join('');
        recordsContainer.innerHTML = html;
    }

    // 显示弹窗
    modal.classList.add('active');
}

/**
 * 关闭弹窗
 */
function closeModal() {
    const modal = document.getElementById('calendarModal');
    modal.classList.remove('active');
}

/**
 * 创建水滴背景粒子
 */
function startWaterDrops() {
    const container = document.getElementById('particlesContainer');
    if (!container) return;

    // 创建多个水滴，使用不同的延迟
    for (let i = 0; i < 15; i++) {
        createWaterDrop(container, Math.random() * 10);
    }
}

/**
 * 创建单个可爱水滴
 */
function createWaterDrop(container, delay = 0) {
    const drop = document.createElement('div');
    drop.className = 'water-drop';

    // 可爱水滴表情
    const waterEmojis = ['💦', '💦', '🌊', '⭐'];
    drop.textContent = waterEmojis[Math.floor(Math.random() * waterEmojis.length)];

    // 随机位置
    drop.style.left = Math.random() * 100 + '%';

    // 随机动画时长
    const duration = 4 + Math.random() * 4;
    drop.style.animationDuration = duration + 's';

    // 设置动画延迟
    drop.style.animationDelay = delay + 's';

    // 随机大小
    const size = 16 + Math.random() * 12;
    drop.style.fontSize = size + 'px';

    container.appendChild(drop);

    // 动画结束后移除并创建新的
    setTimeout(() => {
        drop.remove();
        createWaterDrop(container, Math.random() * 2);
    }, (duration + delay) * 1000);
}

/**
 * 创建可爱水花涟漪效果
 */
function createRipple(x, y) {
    const container = document.getElementById('ripplesContainer');
    if (!container) return;

    const waterEmojis = ['💦', '🌊', '💦'];

    // 创建3层涟漪效果
    for (let i = 0; i < 3; i++) {
        const ripple = document.createElement('div');
        ripple.className = 'water-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.animationDelay = (i * 0.15) + 's';

        // 添加水滴表情
        ripple.textContent = waterEmojis[i];

        container.appendChild(ripple);

        // 动画结束后移除
        setTimeout(() => {
            ripple.remove();
        }, 1500);
    }
}

/**
 * 创建可爱水滴爆发效果
 */
function createParticleBurst(button) {
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 使用rewardContainer来显示爆发效果
    const container = document.getElementById('rewardContainer');
    if (!container) return;

    // 可爱水滴表情
    const waterEmojis = ['💦', '🌊', '💦', '⭐', '✨', '🌟', '💫', '🐰'];

    // 创建10个可爱水滴向不同方向爆发
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'water-particle';

        const angle = (i / 10) * Math.PI * 2;
        const distance = 80 + Math.random() * 50;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.textContent = waterEmojis[i % waterEmojis.length];
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        particle.style.setProperty('--rotation', (Math.random() * 720 - 360) + 'deg');

        container.appendChild(particle);

        // 动画结束后移除
        setTimeout(() => {
            particle.remove();
        }, 800);
    }
}

/**
 * 加载连续打卡数据
 */
function loadStreakData() {
    const data = localStorage.getItem(STREAK_KEY);
    if (data) {
        const parsed = JSON.parse(data);
        currentStreak = parsed.streak || 0;
        lastCheckInDate = parsed.lastDate || null;
    }
}

/**
 * 保存连续打卡数据
 */
function saveStreakData() {
    localStorage.setItem(STREAK_KEY, JSON.stringify({
        streak: currentStreak,
        lastDate: lastCheckInDate
    }));
}

/**
 * 计算连续打卡天数
 */
function calculateStreak() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = formatDate(today);
    const yesterdayStr = formatDate(yesterday);

    // 如果有上次打卡日期
    if (lastCheckInDate) {
        // 如果是昨天，继续累计
        if (lastCheckInDate === yesterdayStr) {
            // 检查昨天是否达标
            if (isDayQualified(yesterdayStr)) {
                // 保持当前连续天数
            } else {
                // 昨天未达标，重置
                currentStreak = 0;
            }
        }
        // 如果是更早的日期，重置
        else if (lastCheckInDate !== todayStr) {
            currentStreak = 0;
        }
    }

    // 检查今天是否已达标
    if (isDayQualified(todayStr)) {
        // 今天还未打卡但数据已存在，说明是从历史数据加载的
        if (!lastCheckInDate || lastCheckInDate !== todayStr) {
            // 检查是否连续
            const prevDay = new Date(today);
            prevDay.setDate(prevDay.getDate() - 1);
            if (lastCheckInDate === formatDate(prevDay)) {
                currentStreak++;
            } else if (lastCheckInDate !== todayStr) {
                currentStreak = 1;
            }
        }
    }

    saveStreakData();
    updateStreakDisplay();
}

/**
 * 检查某天是否达标
 */
function isDayQualified(dateStr) {
    const records = getAllRecords();
    const dayRecords = records.filter(r => r.date === dateStr);
    return dayRecords.length >= dailyGoal;
}

/**
 * 更新连续打卡显示
 */
function updateStreakDisplay() {
    const streakElement = document.getElementById('streakCount');
    if (streakElement) {
        streakElement.textContent = currentStreak;
    }

    // 更新进度条
    const maxDays = 30;
    const progress = Math.min((currentStreak / maxDays) * 100, 100);
    const fillElement = document.getElementById('streakFill');
    if (fillElement) {
        fillElement.style.width = progress + '%';
    }

    // 更新里程碑标记
    const milestones = document.querySelectorAll('.milestone');
    milestones.forEach(milestone => {
        const days = parseInt(milestone.dataset.days);
        if (days <= currentStreak) {
            milestone.classList.add('reached');
            milestone.classList.remove('current');
        } else if (days === currentStreak) {
            milestone.classList.add('current');
            milestone.classList.remove('reached');
        } else {
            milestone.classList.remove('reached', 'current');
        }
    });
}

/**
 * 更新连续打卡
 */
function updateStreak() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = formatDate(today);
    const yesterdayStr = formatDate(yesterday);

    // 检查今天是否已达标
    if (isDayQualified(todayStr)) {
        if (lastCheckInDate === yesterdayStr || lastCheckInDate === todayStr) {
            // 连续打卡
            if (lastCheckInDate !== todayStr) {
                currentStreak++;
                lastCheckInDate = todayStr;
            }
        } else {
            // 开始新的连续
            currentStreak = 1;
            lastCheckInDate = todayStr;
        }
    }

    saveStreakData();
    updateStreakDisplay();
    checkAchievementUnlock();
}

/**
 * 加载已收集的贴纸
 */
function loadCollectedStickers() {
    const data = localStorage.getItem(STICKERS_KEY);
    collectedStickers = data ? JSON.parse(data) : [];
}

/**
 * 保存已收集的贴纸
 */
function saveCollectedStickers() {
    localStorage.setItem(STICKERS_KEY, JSON.stringify(collectedStickers));
}

/**
 * 加载已获得的成就
 */
function loadEarnedBadges() {
    const data = localStorage.getItem(BADGES_KEY);
    earnedBadges = data ? JSON.parse(data) : [];
}

/**
 * 保存已获得的成就
 */
function saveEarnedBadges() {
    localStorage.setItem(BADGES_KEY, JSON.stringify(earnedBadges));
}

/**
 * 初始化贴纸网格
 */
function initStickersGrid() {
    const grid = document.getElementById('stickersGrid');
    if (!grid) return;

    const html = STICKERS.map(sticker => {
        const isUnlocked = collectedStickers.includes(sticker.id);
        return `
            <div class="sticker-item ${isUnlocked ? 'unlocked' : 'locked'}"
                 data-id="${sticker.id}"
                 data-name="${sticker.name}"
                 data-emoji="${sticker.emoji}">
                <span class="sticker-emoji">${isUnlocked ? sticker.emoji : '🔒'}</span>
                <span class="sticker-name">${isUnlocked ? sticker.name : '???'}</span>
                <span class="sticker-requirement">${sticker.requirement}次解锁</span>
                <span class="sticker-lock">🔒</span>
            </div>
        `;
    }).join('');

    grid.innerHTML = html;

    // 更新收集进度
    updateStickerCount();

    // 添加点击事件
    grid.querySelectorAll('.sticker-item').forEach(item => {
        item.addEventListener('click', handleStickerClick);
    });
}

/**
 * 更新贴纸收集计数
 */
function updateStickerCount() {
    const countElement = document.getElementById('stickerCount');
    if (countElement) {
        countElement.textContent = `${collectedStickers.length}/${STICKERS.length}`;
    }
}

/**
 * 处理贴纸点击
 */
function handleStickerClick(event) {
    const item = event.currentTarget;
    const isUnlocked = item.classList.contains('unlocked');

    if (isUnlocked) {
        const emoji = item.dataset.emoji;
        const name = item.dataset.name;

        // 播放点击动画
        const stickerEmoji = item.querySelector('.sticker-emoji');
        stickerEmoji.style.transform = 'scale(1.3) rotate(15deg)';
        setTimeout(() => {
            stickerEmoji.style.transform = '';
        }, 300);

        // 震动反馈
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    } else {
        const requirement = item.querySelector('.sticker-requirement').textContent;
        // 锁住的贴纸也可以点击显示提示
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }
}

/**
 * 初始化成就网格
 */
function initBadgesGrid() {
    const grid = document.getElementById('badgesGrid');
    if (!grid) return;

    const html = BADGES.map(badge => {
        const isUnlocked = earnedBadges.includes(badge.id);
        return `
            <div class="badge-item ${isUnlocked ? 'unlocked' : 'locked'}"
                 data-id="${badge.id}"
                 data-name="${badge.name}"
                 data-emoji="${badge.emoji}">
                <span class="badge-emoji">${isUnlocked ? badge.emoji : '🔒'}</span>
                <span class="badge-name">${isUnlocked ? badge.name : '???'}</span>
                <span class="badge-days">${badge.days}天</span>
                <span class="badge-lock">🔒</span>
            </div>
        `;
    }).join('');

    grid.innerHTML = html;

    // 更新成就计数
    updateBadgeCount();

    // 添加点击事件
    grid.querySelectorAll('.badge-item').forEach(item => {
        item.addEventListener('click', handleBadgeClick);
    });
}

/**
 * 更新成就计数
 */
function updateBadgeCount() {
    const countElement = document.getElementById('badgeCount');
    if (countElement) {
        countElement.textContent = `${earnedBadges.length}/${BADGES.length}`;
    }
}

/**
 * 处理成就点击
 */
function handleBadgeClick(event) {
    const item = event.currentTarget;
    const isUnlocked = item.classList.contains('unlocked');

    if (isUnlocked) {
        const emoji = item.dataset.emoji;
        const name = item.dataset.name;

        // 播放点击动画
        const badgeEmoji = item.querySelector('.badge-emoji');
        badgeEmoji.style.transform = 'scale(1.3) rotate(15deg)';
        setTimeout(() => {
            badgeEmoji.style.transform = '';
        }, 300);

        // 震动反馈
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    } else {
        // 锁住的成就点击
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }
}

/**
 * 检查是否解锁新成就
 */
function checkAchievementUnlock() {
    let unlocked = false;

    BADGES.forEach(badge => {
        if (currentStreak >= badge.days && !earnedBadges.includes(badge.id)) {
            earnedBadges.push(badge.id);
            unlocked = true;

            // 显示解锁动画
            showBadgeReward(badge);

            // 更新成就网格
            setTimeout(() => {
                initBadgesGrid();
            }, 2000);
        }
    });

    if (unlocked) {
        saveEarnedBadges();
    }

    return unlocked;
}

/**
 * 显示成就解锁动画
 */
function showBadgeReward(badge) {
    const container = document.getElementById('rewardContainer');
    if (!container) return;

    const popup = document.createElement('div');
    popup.className = 'badge-popup';
    popup.innerHTML = `
        <span class="badge-popup-emoji">${badge.emoji}</span>
        <h3 class="badge-popup-title">🎉 成就解锁！</h3>
        <p class="badge-popup-desc">${badge.name}</p>
        <p class="badge-popup-desc">${badge.desc}</p>
        <span class="badge-popup-badge">${badge.emoji}</span>
    `;

    container.appendChild(popup);

    // 震动反馈
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100, 50, 200]);
    }

    // 2秒后移除
    setTimeout(() => {
        popup.remove();
    }, 2000);
}

/**
 * 显示贴纸解锁动画
 */
function showStickerReward(sticker) {
    const container = document.getElementById('rewardContainer');
    if (!container) return;

    // 创建光晕
    const glow = document.createElement('div');
    glow.className = 'reward-glow';
    container.appendChild(glow);

    // 创建贴纸
    const stickerElement = document.createElement('div');
    stickerElement.className = 'reward-item';
    stickerElement.textContent = sticker.emoji;
    container.appendChild(stickerElement);

    // 创建星星爆发
    const starsContainer = document.createElement('div');
    starsContainer.className = 'reward-stars';
    const stars = ['✨', '⭐', '🌟', '💫'];
    for (let i = 0; i < 8; i++) {
        const star = document.createElement('span');
        star.className = 'reward-star';
        star.textContent = stars[Math.floor(Math.random() * stars.length)];

        const angle = (i / 8) * Math.PI * 2;
        const distance = 60 + Math.random() * 40;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        star.style.setProperty('--tx', tx + 'px');
        star.style.setProperty('--ty', ty + 'px');
        star.style.left = '50%';
        star.style.top = '50%';

        starsContainer.appendChild(star);
    }
    container.appendChild(starsContainer);

    // 震动反馈
    if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50, 30, 100]);
    }

    // 2秒后移除所有元素
    setTimeout(() => {
        glow.remove();
        stickerElement.remove();
        starsContainer.remove();
    }, 2000);
}

/**
 * 检查是否解锁新贴纸
 */
function checkStickerUnlock(count) {
    let unlocked = false;

    STICKERS.forEach(sticker => {
        // 如果达到要求且还没收集
        if (count >= sticker.requirement && !collectedStickers.includes(sticker.id)) {
            collectedStickers.push(sticker.id);
            unlocked = true;

            // 显示解锁动画
            showStickerReward(sticker);

            // 更新贴纸网格
            setTimeout(() => {
                initStickersGrid();
            }, 2000);
        }
    });

    if (unlocked) {
        saveCollectedStickers();
    }

    return unlocked;
}

/**
 * 处理打卡点击
 */
function handleCheckIn(event) {
    // 获取点击位置用于涟漪效果
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left + rect.left;
    const y = event.clientY - rect.top + rect.top;

    // 添加震动反馈（仅在支持的设备上）
    if (navigator.vibrate) {
        navigator.vibrate([30, 20, 30]);
    }

    // 添加涟漪效果
    createRipple(x, y);

    // 添加粒子爆发效果
    const checkInBtn = document.getElementById('checkInBtn');
    createParticleBurst(checkInBtn);

    // 添加按钮点击动画
    checkInBtn.classList.add('check-in-success');
    setTimeout(() => {
        checkInBtn.classList.remove('check-in-success');
    }, 600);

    // 创建记录
    const record = {
        id: Date.now(),
        date: currentDate,
        timestamp: Date.now(),
        timeStr: formatTime(new Date()),
        dateTimeStr: formatDateTime(new Date())
    };

    // 保存记录
    saveRecord(record);

    // 更新连续打卡
    updateStreak();

    // 更新UI
    updateUI();
}

/**
 * 保存单条记录
 */
function saveRecord(record) {
    const records = getAllRecords();
    records.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/**
 * 获取所有记录
 */
function getAllRecords() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * 获取今天的记录
 */
function getTodayRecords() {
    const records = getAllRecords();
    return records.filter(record => record.date === currentDate);
}

/**
 * 获取总打卡次数（用于水果解锁）
 */
function getTotalCount() {
    const records = getAllRecords();
    return records.length;
}

/**
 * 清理旧的记录（只保留最近30天）
 */
function cleanOldRecords() {
    const records = getAllRecords();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = formatDate(thirtyDaysAgo);

    const filteredRecords = records.filter(record => record.date >= cutoffDate);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecords));
}

/**
 * 更新进度环
 */
function updateProgressRing(count) {
    const progressRing = document.getElementById('progressRing');
    if (!progressRing) return;

    const circumference = 283; // 2 * PI * 45
    const progress = Math.min(count / dailyGoal, 1);
    const offset = circumference - (progress * circumference);

    progressRing.style.strokeDashoffset = offset;

    // 如果达到目标，添加完成状态
    if (count >= dailyGoal) {
        progressRing.style.stroke = '#38ef7d';
        progressRing.style.filter = 'drop-shadow(0 0 8px #38ef7d)';
    } else {
        progressRing.style.stroke = '#00d9ff';
        progressRing.style.filter = 'none';
    }
}

/**
 * 加载并显示数据
 */
function loadData() {
    // 清理旧记录
    cleanOldRecords();

    // 更新UI
    updateUI();
}

/**
 * 更新UI显示
 */
function updateUI() {
    // 获取今天的记录
    const todayRecords = getTodayRecords();
    const currentCount = todayRecords.length;

    // 更新今日打卡次数
    const countElement = document.getElementById('todayCount');
    countElement.textContent = currentCount;

    // 如果次数变化了，添加弹跳动画
    if (currentCount !== previousCount && currentCount > 0) {
        countElement.classList.remove('pop');
        // 强制重绘
        void countElement.offsetWidth;
        countElement.classList.add('pop');

        // 动画结束后移除class
        setTimeout(() => {
            countElement.classList.remove('pop');
        }, 400);
    }

    previousCount = currentCount;

    // 更新进度环
    updateProgressRing(currentCount);

    // 检查是否解锁新贴纸（使用总打卡次数）
    const totalCount = getTotalCount();
    checkStickerUnlock(totalCount);

    // 更新日历（如果当前显示的是本月）
    const now = new Date();
    if (calendarYear === now.getFullYear() && calendarMonth === now.getMonth()) {
        renderCalendar();
    }

    // 更新记录列表
    updateRecordList(todayRecords);
}

/**
 * 更新记录列表
 */
function updateRecordList(records) {
    const recordList = document.getElementById('recordList');

    if (records.length === 0) {
        recordList.innerHTML = `
            <p class="empty-state">
                <span class="empty-icon">🐰</span>
                今天还没有喝水记录哦~
            </p>
        `;
        return;
    }

    // 按时间倒序排列
    const sortedRecords = [...records].sort((a, b) => b.timestamp - a.timestamp);

    // 生成列表HTML，每个项目有不同的延迟
    const html = sortedRecords.map((record, index) => `
        <div class="record-item" style="animation-delay: ${index * 0.08}s">
            <div class="record-info">
                <div class="record-time">${record.timeStr}</div>
                <div class="record-date">${record.dateTimeStr}</div>
            </div>
            <span class="record-icon">💦</span>
        </div>
    `).join('');

    recordList.innerHTML = html;
}

/* ==================== Tab导航功能 ==================== */

/**
 * 初始化Tab导航
 */
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // 移除所有active状态
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // 添加active状态到当前tab
            btn.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');

            // 如果切换到日历tab，更新统计
            if (targetTab === 'calendar') {
                updateCalendarStats();
            }

            // 震动反馈
            if (navigator.vibrate) {
                navigator.vibrate(20);
            }
        });
    });
}

/* ==================== 天气功能 ==================== */

/**
 * 获取天气数据
 */
async function fetchWeather() {
    const weatherLocation = document.getElementById('weatherLocation');
    const weatherTemp = document.getElementById('weatherTemp');
    const weatherDesc = document.getElementById('weatherDesc');
    const weatherIconLarge = document.getElementById('weatherIconLarge');

    // 显示加载状态
    weatherLocation.textContent = '获取中...';
    weatherTemp.textContent = '--°C';
    weatherDesc.textContent = '正在获取天气信息';
    weatherIconLarge.textContent = '🌤️';

    try {
        // 尝试获取位置
        let latitude, longitude;

        if (navigator.geolocation) {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve(pos),
                    (err) => reject(err),
                    { timeout: 10000 }
                );
            });
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
        }

        // 如果没有API密钥或位置获取失败，使用模拟数据
        if (!WEATHER_API_KEY || !latitude || !longitude) {
            console.log('Using mock weather data');
            showMockWeather();
            return;
        }

        // 调用OpenWeatherMap API
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&lang=zh_cn`
        );

        if (!response.ok) {
            throw new Error('Weather API error');
        }

        const data = await response.json();
        currentWeather = {
            temp: Math.round(data.main.temp),
            condition: data.weather[0].main,
            description: data.weather[0].description,
            icon: data.weather[0].icon
        };

        // 更新UI
        updateWeatherDisplay();
        updateWaterRecommendation();

    } catch (error) {
        console.error('Weather fetch error:', error);
        showMockWeather();
    }
}

/**
 * 显示模拟天气数据（当无法获取真实天气时）
 */
function showMockWeather() {
    // 随机生成天气数据用于演示
    const mockWeathers = [
        { temp: 25, condition: 'Sunny', description: '晴天', icon: '☀️' },
        { temp: 22, condition: 'Cloudy', description: '多云', icon: '⛅' },
        { temp: 18, condition: 'Rainy', description: '小雨', icon: '🌧️' },
        { temp: 30, condition: 'Hot', description: '炎热', icon: '🌡️' },
        { temp: 15, condition: 'Cool', description: '凉爽', icon: '🌤️' }
    ];

    const randomWeather = mockWeathers[Math.floor(Math.random() * mockWeathers.length)];
    currentWeather = randomWeather;

    document.getElementById('weatherLocation').textContent = '演示模式';
    document.getElementById('weatherTemp').textContent = `${randomWeather.temp}°C`;
    document.getElementById('weatherDesc').textContent = randomWeather.description;
    document.getElementById('weatherIconLarge').textContent = randomWeather.icon;

    updateWaterRecommendation();
}

/**
 * 更新天气显示
 */
function updateWeatherDisplay() {
    if (!currentWeather) return;

    document.getElementById('weatherLocation').textContent = '当前位置';
    document.getElementById('weatherTemp').textContent = `${currentWeather.temp}°C`;
    document.getElementById('weatherDesc').textContent = currentWeather.description;
    document.getElementById('weatherIconLarge').textContent = getWeatherIcon(currentWeather.condition);
}

/**
 * 根据天气条件获取图标
 */
function getWeatherIcon(condition) {
    const iconMap = {
        'Sunny': '☀️',
        'Cloudy': '⛅',
        'Rainy': '🌧️',
        'Snowy': '❄️',
        'Stormy': '⛈️',
        'Hot': '🌡️',
        'Cool': '🌤️'
    };
    return iconMap[condition] || '🌤️';
}

/**
 * 根据天气更新喝水建议
 */
function updateWaterRecommendation() {
    if (!currentWeather) return;

    let recommendation = '';
    let goal = 8;
    let tips = [];

    // 根据温度调整目标
    if (currentWeather.temp >= 35) {
        goal = 12;
        recommendation = '今天好热呀！建议多喝水补充水分哦~';
        tips = [
            '💦 小兔子说：天热时要多喝水！',
            '🍉 可以吃些西瓜补充水分',
            '😴 睡前也要记得喝水哦'
        ];
    } else if (currentWeather.temp >= 30) {
        goal = 10;
        recommendation = '今天天气炎热，建议多喝几杯水！';
        tips = [
            '💦 多喝水防止中暑',
            '🍎 饭前喝水有助消化',
            '😴 睡前适量补充水分'
        ];
    } else if (currentWeather.temp >= 25) {
        goal = 9;
        recommendation = '今天天气不错，适合多喝水！';
        tips = [
            '💦 早上起床先喝一杯温水',
            '🍎 饭前半小时喝水有助消化',
            '😴 睡前适量补充水分'
        ];
    } else if (currentWeather.temp >= 20) {
        goal = 8;
        recommendation = '今天天气舒适，正常喝水就好~';
        tips = [
            '💦 早上起床先喝一杯温水',
            '🍎 饭前半小时喝水有助消化',
            '😴 睡前适量补充水分'
        ];
    } else if (currentWeather.temp >= 15) {
        goal = 7;
        recommendation = '今天天气凉爽，可以喝点温水~';
        tips = [
            '💦 喝温水更舒适',
            '🍎 可以喝些热汤补水',
            '😴 睡前不要喝太多水哦'
        ];
    } else if (currentWeather.temp >= 10) {
        goal = 6;
        recommendation = '今天天气冷，喝点热乎乎的水吧！';
        tips = [
            '💦 喝热水暖暖身子',
            '🍲 喝些热汤也很好',
            '😴 睡前不要喝太多水哦'
        ];
    } else {
        goal = 6;
        recommendation = '今天好冷呀，多喝热水保暖！';
        tips = [
            '💦 多喝热水保暖身体',
            '🍲 热汤是很好的选择',
            '😴 睡前不要喝太多水哦'
        ];
    }

    // 根据天气状况调整
    if (currentWeather.condition === 'Rainy' || currentWeather.condition === 'Stormy') {
        goal += 1;
        recommendation += ' 雨天也要记得补水哦！';
    }

    // 更新目标
    dailyGoal = goal;

    // 更新UI
    document.getElementById('recommendationAmount').textContent = goal;
    document.getElementById('recommendationText').textContent = recommendation;

    // 更新提示
    const tipsContainer = document.getElementById('recommendationTips');
    tipsContainer.innerHTML = tips.map(tip => `
        <div class="tip-item">
            ${tip}
        </div>
    `).join('');

    // 更新首页显示的目标
    updateDailyGoalDisplay();
}

/**
 * 更新每日目标显示
 */
function updateDailyGoalDisplay() {
    const dailyGoalElement = document.getElementById('dailyGoal');
    const buttonHintElement = document.getElementById('buttonHint');

    if (dailyGoalElement) {
        dailyGoalElement.textContent = dailyGoal;
    }

    if (buttonHintElement) {
        buttonHintElement.textContent = `每天喝够${dailyGoal}杯就能获得小贴纸哦~`;
    }
}

/**
 * 更新日历统计
 */
function updateCalendarStats() {
    const records = getAllRecords();

    // 计算达标天数
    const qualifiedDays = new Set();
    records.forEach(record => {
        if (isDayQualified(record.date)) {
            qualifiedDays.add(record.date);
        }
    });

    const qualifiedCount = qualifiedDays.size;

    // 计算总杯数
    const totalCups = records.length;

    // 更新UI
    document.getElementById('calendarQualifiedCount').textContent = qualifiedCount;
    document.getElementById('calendarTotalCups').textContent = totalCups;
}
