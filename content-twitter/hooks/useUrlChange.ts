import {useEffect, useState} from "react";

export function useUrlChange() {
    const [currentUrl, setCurrentUrl] = useState(window.location.href);

    useEffect(() => {
        const checkUrlChange = () => {
            const url = window.location.href;
            if (url !== currentUrl) {
                setCurrentUrl(url);
            }
        };

        const interval = setInterval(checkUrlChange, 500);

        return () => clearInterval(interval);
    }, [currentUrl]);


    return currentUrl;
}
