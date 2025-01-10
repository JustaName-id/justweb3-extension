import React, {useEffect} from "react";
import ReactDOM from "react-dom";
import {JustEnsCard, useJustWeb3} from "@justweb3/widget";
import {useRecords} from "@justaname.id/react";
import {P} from "@justweb3/ui";
import {useResolvableEns} from "../../App";

export interface JustEnsCardPortalProps {
    ens: string;
    container: HTMLElement;
    style?: React.CSSProperties;
    setScrollY: (y: number) => void;
}

export const HoverEnsCard: React.FC<JustEnsCardPortalProps> = ({ ens, container , style, setScrollY }) => {

    const { records, isRecordsPending } = useResolvableEns(ens)
    const reactContainer = React.useMemo(() => {
        const div = document.createElement('div');
        Object.assign(div.style, style);
        container.after(div);
        setScrollY(window.scrollY);
        return div;
    }, [container]);

    React.useEffect(() => {
        return () => {
            if (reactContainer.parentNode) {
                reactContainer.parentNode.removeChild(reactContainer);
            }
        };
    }, [reactContainer]);

    return <>
        {
            ReactDOM.createPortal(<>
                    {isRecordsPending ?
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '4px',
                            height: '15px',
                        }}>
                            <P>Loading...</P>
                        </div>
                        :

                        records &&
                        <JustEnsCard prefetchedRecords={records} addressOrEns={ens}
                                       loading={false}
                                       style={{width: '100%', marginTop: '10px', marginBottom: '10px'}}/>}
</>
                ,
                reactContainer
            )
        }
        </>;

}