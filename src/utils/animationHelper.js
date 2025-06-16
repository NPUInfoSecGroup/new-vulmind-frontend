export default {
    safeAnimate(element, animation, duration = 1000) {
        let interrupted = false;
        const timeoutId = setTimeout(() => {
            if (!interrupted) {
                element.style.transition = 'none';
                element.style.opacity = 1;
                interrupted = true;
            }
        }, duration + 500); // 超时保护

        return new Promise(resolve => {
            element.style.transition = `all ${duration}ms ease`;
            Object.assign(element.style, animation.to);

            setTimeout(() => {
                clearTimeout(timeoutId);
                if (!interrupted) resolve();
            }, duration);
        });
    }
}