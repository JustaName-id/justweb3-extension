import React, {useMemo} from "react";
import ReactDOM from "react-dom";
import {getChainIcon, getTextRecordIcon, JustEnsCard, useJustWeb3} from "@justweb3/widget";
import {P, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, useJustWeb3Theme} from "@justweb3/ui";
import {useRecords} from "@justaname.id/react";
import {useResolvableEns} from "../../App";

export interface JustEnsCardPortalProps {
    ens: string;
    container: HTMLElement;
    style?: React.CSSProperties;
}
export const ProfileCard: React.FC<JustEnsCardPortalProps> = ({ ens, container , style }) => {
    const { records, isRecordsPending } = useResolvableEns(ens)
    const { color } = useJustWeb3Theme()
    const [isHovered, setIsHovered] = React.useState(false);
    const backgroundColor = useMemo(() => {
        return color['background']
    }, [color]);

    const borderColor = useMemo(() => {
        switch (backgroundColor) {
            case 'hsl(0, 0%, 100%)':
                return 'rgb(207, 217, 222)'
            case 'hsl(0, 0%, 0%)':
                return 'rgb(83, 100, 113)'
            case 'hsl(210, 34%, 13%)':
                return 'rgb(83, 100, 113)'
            default:
                return 'rgb(207, 217, 222)'
        }
    }, [backgroundColor]);

    const hoverBackgroundColor = useMemo(() => {
        switch (backgroundColor) {
            case 'hsl(0, 0%, 100%)':
                return 'rgba(15, 20, 25, 0.1)'
            case 'hsl(0, 0%, 0%)':
                return 'rgba(239, 243, 244, 0.1)'
            case 'hsl(210, 34%, 13%)':
                return 'rgba(239, 243, 244, 0.1)'
            default:
                return 'rgba(239, 243, 244, 0.1)'
        }
    }, [backgroundColor]);

    const { openEnsProfile } = useJustWeb3();
    const recordsContainer = React.useMemo(() => {
        const div = document.createElement('div');
        container.after(div);
        return div;
    }, [container]);

    const viewEnsContainer = React.useMemo(() => {
        const div = document.createElement('div');
        const placementTracking = container?.previousElementSibling?.lastElementChild?.lastElementChild as HTMLElement
        placementTracking?.before(div);

        return div;
    }, [container]);

    React.useEffect(() => {
        return () => {
            if (recordsContainer.parentNode) {
                recordsContainer.parentNode.removeChild(recordsContainer);
            }
            if (viewEnsContainer.parentNode) {
                viewEnsContainer.parentNode.removeChild(viewEnsContainer);
            }
        };
    }, []);



    return <>
        {
            !isRecordsPending && records && records?.sanitizedRecords?.ethAddress && ReactDOM.createPortal(
                <button style={{
                    padding:'0 16px',
                    border: '1px solid rgb(83, 100, 113)',
                    borderColor: borderColor,
                    backgroundColor: isHovered ? hoverBackgroundColor:'transparent',
                    borderRadius: '9999px',
                    minHeight:"36px",
                    height:'fit-content',
                    transitionDuration: '0.2s',
                    cursor: 'pointer',
                    transitionProperty: 'background-color, box-shadow',
                    fontWeight:'bold',
                    fontFamily:'TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    marginRight:'8px',
                    marginBottom:'12px',
                }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    onClick={() => openEnsProfile(ens)}
                >
                    ENS
                </button>
                ,
                viewEnsContainer
            )
        }

        {ReactDOM.createPortal(
            <>
                {
                    isRecordsPending ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '4px',
                            height: '15px',
                            marginBottom: '12px',
                        }}>
                            <P>Loading...</P>
                        </div>
                    ) : (
                        records &&( records?.sanitizedRecords.allAddresses.length > 0 || records?.sanitizedRecords.socials.length > 0) ? (

                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '4px',
                            marginBottom: '12px',
                            height: '15px',
                        }}>
                            {records?.sanitizedRecords.allAddresses.map((address, index) =>
                                <TooltipProvider delayDuration={100} key={`${ens}-${index}-address`}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div style={{
                                                width: 13,
                                                height: '100%',
                                                display: 'flex',
                                                placeContent: 'center',
                                                placeItems: 'center',
                                            }}
                                            >
                                                {React.cloneElement(getChainIcon(address.symbol), {
                                                        width: 13,
                                                        height: 13,
                                                    }
                                                )}
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
                                                {address.symbol.toUpperCase()}: {address.value}
                                            </P>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            {records?.sanitizedRecords.socials.map((social, index) =>
                                <TooltipProvider delayDuration={100} key={`${ens}-${index}-address`}>
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
                                                        width: 14,
                                                        height: 14,
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
                        </div>
                    ) : null)
                }

            </>
            ,
            recordsContainer
        )}</>;
}