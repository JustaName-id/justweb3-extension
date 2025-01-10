import React, {useEffect} from 'react'
import {checkIfEnsValid, extractEnsFromText} from "../../utils/checkIfEns";
import {ProfileCard} from "./ProfileCard";
import {useUrlChange} from "../../hooks/useUrlChange";



export const Profile = () => {
    const [ensElement, setEnsElement] = React.useState<{ ens: string; element: Element } | null>(null);
    const currentUrl = useUrlChange();

    const handleUserNameElement = (targetElement: Element | null) => {
        if (!targetElement) {
            setEnsElement(null);
            return;
        }


        const ensElement = targetElement.querySelector(' span');
        const ens = ensElement?.textContent?.toLowerCase() || "Unknown User";

        if (!ens) {
            setEnsElement(null);
            return;
        }

        const extractedEns = extractEnsFromText(ens);
        if(extractedEns === '') {
            setEnsElement(null);
            return;
        }

        setEnsElement({ ens: extractedEns, element: targetElement });
    };

    useEffect(() => {
        setEnsElement(null);
        const interval = setInterval(() => {
            const targetElement = document.querySelector('[data-testid="UserName"]')

            handleUserNameElement(targetElement);
        }, 1000);


        return () => {
            clearInterval(interval);
            setEnsElement(null);
        }
    }, [currentUrl]);

    return (
        <>
            {ensElement && (
                <ProfileCard
                    ens={ensElement.ens}
                    container={ensElement.element as HTMLElement}
                />
            )}
        </>    
    );

}
