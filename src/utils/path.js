// 重构为通用路径工具
export default {
    resolve(...segments) {
        return segments.join('/').replace(/\/+/g, '/');
    },
    asset(path) {
        return require(`@/assets/${path}`);
    }
}