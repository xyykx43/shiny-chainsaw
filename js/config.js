// ==================== 图片配置 ====================
const IMAGE_BASE_URL = './';
const IMAGE_FILENAME_TEMPLATE = '{id}.png';
function getCardImageUrl(cardId) {
    const idx = cardId - 1;
    const padded = idx.toString().padStart(2, '0');
    return IMAGE_BASE_URL + IMAGE_FILENAME_TEMPLATE.replace('{id}', padded);
}
function getBackImageUrl() {
    return IMAGE_BASE_URL + 'beibu.png';
}
document.addEventListener('DOMContentLoaded', function() {
    const donateQr = document.getElementById('donateQr');
    if (donateQr) donateQr.src = IMAGE_BASE_URL + 'zanshangma.png';
});
