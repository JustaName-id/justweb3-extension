import React, {useEffect} from "react";
import {useRecords} from "@justaname.id/react";
import {getChainIcon, getTextRecordIcon} from "@justweb3/widget";
import ReactDOM from "react-dom";
import {P, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, CopyIcon, CopiedIcon} from "@justweb3/ui";
import {useResolvableEns} from "../../App";

export interface TweetSocialsProps {
    ens: string;
    container: HTMLElement;
}
export const TweetSocials: React.FC<TweetSocialsProps> = ({ ens, container}) => {
    const { records, isRecordsPending } = useResolvableEns(ens)
    const [copied, setCopied] = React.useState<{container: HTMLElement, value: string} | null>(null);

    const handleCopy = (container: HTMLElement, value: string) => {
        navigator.clipboard.writeText(value).then(() => {
            setCopied({container, value});
            setTimeout(() => {
                setCopied(null);
            }, 2000);
        });
    }

    const reactContainer = React.useMemo(() => {
        const div = document.createElement('div');
        div.classList.add("ens-data-container");
        div.style.display = 'flex';
        div.style.flexDirection = 'row';
        container.after(div);
        return div;
    }, [container]);


    React.useEffect(() => {
        return () => {
            if (reactContainer.parentNode) {
                reactContainer.parentNode.removeChild(reactContainer);
            }
        };
    }, [reactContainer]);

    return (
        ReactDOM.createPortal(
            isRecordsPending ?
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '4px',
                    height: '15px',
                }}>
                    <P>Loading...</P>
                </div>
                :
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '4px',
                }}>
                    {records?.sanitizedRecords.allAddresses.map((address, index) =>
                        <TooltipProvider delayDuration={100} key={`${ens}-${index}-address`}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div style={{
                                        width: 13,
                                        height: 15,
                                        display: 'flex',
                                        placeContent: 'center',
                                        placeItems: 'center',
                                    }}
                                    >
                                        {React.cloneElement(getChainIcon(address.symbol), {
                                                width: '13px',
                                                height: '100%',
                                            }
                                        )}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        gap: '4px',
                                    }}>
                                        <P
                                            style={{
                                                fontSize: '12px',
                                                fontWeight: 900,
                                                lineHeight: '150%',
                                                color: 'inherit',
                                            }}>
                                            {address.symbol.toUpperCase()}: {address.value}
                                        </P>
                                        {
                                            copied?.value === address.value && copied.container === reactContainer ?

                                                <CopiedIcon
                                                    width={15}
                                                    fill={'var(--justweb3-background-color)'}
                                                />
                                                :
                                                <CopyIcon
                                                    width={15}
                                                    onClick={() => handleCopy(reactContainer, address.value)}
                                                    style={{
                                                        cursor: 'pointer',
                                                    }}
                                                    fill={'var(--justweb3-background-color)'}
                                                />
                                        }

                                    </div>

                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {records?.sanitizedRecords.socials.map((social, index) =>
                        <TooltipProvider delayDuration={100} key={`${ens}-${index}-socials`}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        placeContent: 'center',
                                        placeItems: 'center',
                                    }}>
                                        {
                                            React.cloneElement(getTextRecordIcon(social.key), {
                                                key: `${ens}-${index}-${social.key}`,
                                                width: 15,
                                                height: 15,
                                            })
                                        }
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <P
                                        style={{
                                            fontSize: '12px',
                                            fontWeight: 900,
                                            lineHeight: '150%',
                                            color: 'inherit',
                                        }}
                                    >
                                        {social.name}: {social.value}
                                    </P>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>,
            reactContainer
        ));
}