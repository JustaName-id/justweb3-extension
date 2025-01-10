import { useEffect, useState } from "react";
import { extractEnsFromText} from "../../utils/checkIfEns";
import { useMounted } from "@justaname.id/react";
import {ProfileCard} from "../Profiles/ProfileCard";
import {TweetSocials} from "./TweetSocials";

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

export const Tweets = () => {
    const [tweetsWithEnsName, setEnsElement] = useState<{ ens: string; element: Element, id: string }[]>([]);
    const mounted = useMounted();

    const handleUserNameElement = (targetElement: HTMLSpanElement) => {
        if (targetElement.hasAttribute('data-ens-processed')) {
            return;

        }
        const container = targetElement?.textContent?.toLowerCase() || "Unknown User";
        if (!container) {
            return;

        }

        const ensExtracted = extractEnsFromText(container);

        if (!ensExtracted) {
            return;
        }


        const aParent = targetElement?.parentElement?.parentElement?.parentElement?.parentElement;

        if (!aParent || (aParent.tagName !== 'A')) {
            return;
        }

        if (aParent.getAttribute('aria-label') === 'Followers you know') {
            return;
        }

        let parent = aParent;

        while (parent.children.length !== 2) {
            if (!parent.parentElement) {
                break;
            }
            parent = parent.parentElement;
        }

        if (!parent) {
            return;
        }

        if(parent?.getAttribute('data-testid') === 'card.wrapper'){
            return;
        }

        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.flexDirection === 'column') {
            if(parent?.firstElementChild) {
                targetElement.setAttribute('data-ens-processed', 'true');

                setEnsElement((prev) => [...prev, {
                    ens: ensExtracted,
                    element: parent?.firstElementChild as HTMLElement,
                    id: Math.random().toString(36).substring(7)
                }])

            }
        }

        if(parentStyle.flexDirection ==='row'){
            targetElement.setAttribute('data-ens-processed', 'true');

            setEnsElement((prev) => [...prev, {
                ens: ensExtracted,
                element: parent as HTMLElement,
                id: Math.random().toString(36).substring(7)
            }])
        }


    }

    useEffect(() => {
        if (!mounted) return;

        const interval = setInterval(() => {
            const existingElements = document.querySelectorAll('span');
            existingElements.forEach((element) => {
                handleUserNameElement(element);
            });
        }, 1000);

        return () => {
            clearInterval(interval);
        }
    }, [mounted]);

    return <>
        {
            tweetsWithEnsName.map(({ ens, element, id }) => (
                <TweetSocials ens={ens} container={element as HTMLElement} key={id} />
            ))
        }
    </>
};