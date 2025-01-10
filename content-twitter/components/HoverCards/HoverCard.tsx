import {useEffect, useRef, useState} from "react";
import { extractEnsFromText} from "../../utils/checkIfEns";
import { useMounted } from "@justaname.id/react";
import {HoverEnsCard} from "./HoverEnsCard";

const hashElement = (element: Element): string => {
    const content = element.outerHTML || element.textContent || '';
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return hash.toString();
};

export const HoverCards = () => {
    const [tweetsWithEnsName, setEnsElement] = useState<{ ens: string; element: Element, id: string }[]>([]);
    const mounted = useMounted();
    const scrollY = useRef<number>(0);

    const handleUserNameElement = (targetElement: Element, remove=false) => {

        if (targetElement.hasAttribute('hover-card-ens-processed') && !remove) {
            return;
        }

        const div = document.createElement('div');
        const clone = targetElement.cloneNode(true) as Element;
        div.appendChild(clone);

        const usernameElement = targetElement.querySelector('div a div div span span');

        if (!usernameElement) {
            return;
        }

        const ens = usernameElement ? usernameElement?.textContent?.trim() : null;

        if (!ens) {
            return;
        }

        const ensExtracted = extractEnsFromText(ens.toLowerCase());

        if (!ensExtracted) {
            return;
        }

        if(tweetsWithEnsName.find(({ ens }) => ens === ensExtracted)){
            return;
        }

        const handleElement = targetElement.querySelector('div')?.querySelector('div')?.querySelector('div')?.nextElementSibling

        if (!handleElement) {
            return;
        }

        if (remove) {
            setEnsElement((prev) => prev.filter(({ ens }) => ens !== ensExtracted));
            return;
        }

        targetElement.setAttribute('hover-card-ens-processed', 'true');

        setEnsElement((prev) => [...prev, { ens: ensExtracted, element: handleElement, id: hashElement(targetElement)}])
    };

    useEffect(() => {
        if (!mounted) return;

        const backgroundObserver = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node instanceof Element) {

                        const targetElement =  node.querySelector('[data-testid="HoverCard"] div a div div span span');

                        if (targetElement) {

                            const container = targetElement.closest('[data-testid="HoverCard"]');
                            if (container) {
                                handleUserNameElement(container);
                            }
                        }
                    }
                });

                mutation.removedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node instanceof Element) {

                        if(node.hasAttribute('role') && node.getAttribute('role') === 'dialog'){
                            window.scroll(0, scrollY.current);
                            scrollY.current = 0;
                        }

                        const targetElement = node.querySelector('[data-testid="HoverCard"]');
                        if (targetElement) {
                            handleUserNameElement(targetElement, true);
                        }
                    }
                })
            }
        });

        backgroundObserver.observe(document.body, {
            subtree: true,
            childList: true,
        });

        return () => {
            backgroundObserver.disconnect();
        };
    }, [mounted]);


    const setScrollY = (y: number) => {
        scrollY.current = y;
    }

    return <>
        {
            tweetsWithEnsName.map(({ ens, element, id }) => (
                <HoverEnsCard ens={ens} container={element as HTMLElement} key={id} setScrollY={setScrollY} />
            ))
        }
    </>
};