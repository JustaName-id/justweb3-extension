import React, {useEffect} from "react";
import {mainnet} from "viem/chains";
import {JustWeb3Provider} from "@justweb3/widget";
import "@justweb3/widget/styles.css";
import {type Records, useMounted, useRecords} from "@justaname.id/react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {createConfig, type CreateConfigParameters, http, WagmiProvider} from "wagmi";
import {useJustWeb3Theme, convertToHSL} from "@justweb3/ui";
import {Profile} from "./components/Profiles/Profile";
import {Tweets} from "./components/Tweets/Tweets";
import {HoverCards} from "./components/HoverCards/HoverCard";

const queryClient = new QueryClient();

export const SharedContext = React.createContext<{ getResolvableEns: (ens: string) => Promise<Records | undefined>, unresolvableEns:string[] }>({
    getResolvableEns: async () => undefined,
    unresolvableEns: []
})

export const SharedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { getRecords } = useRecords();
    const ensesBeingFetched = React.useRef<string[]>([])
    const unresolvableEns = React.useRef<string[]>([])
    const getResolvableEns = async (ens: string, retry = 0) => {
        if (ensesBeingFetched.current.includes(ens)) {
            await new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (!ensesBeingFetched.current.includes(ens)) {
                        resolve(null)
                        clearInterval(interval)
                    }
                }, 1000)
            })
        }

        if (unresolvableEns.current.includes(ens)) {
            return
        }
        let records: Records | undefined

        try {
            ensesBeingFetched.current.push(ens)
            records = await getRecords({
                ens,
                chainId: mainnet.id,
            })
        }catch (error) {
            if (
                error instanceof Error &&
                (error.message.includes('NotFound') ||
                error.message.includes('ETH address not found'))
            ) {
                unresolvableEns.current.push(ens)
            }
            else {
                if (retry < 3) {
                    setTimeout(() => {
                        getResolvableEns(ens, retry + 1)
                    }, 1000)
                }
            }
        }

        ensesBeingFetched.current = ensesBeingFetched.current.filter((e) => e !== ens)
        return records
    }

    return (
        <SharedContext.Provider value={{ getResolvableEns, unresolvableEns: unresolvableEns.current }}>
            {children}
        </SharedContext.Provider>
    );
}

export const useResolvableEns = (ens: string) => {
    const { getResolvableEns, unresolvableEns } = React.useContext(SharedContext)

    const [records, setRecords] = React.useState<Records | undefined>(undefined)
    const [isRecordsPending, setIsRecordsPending] = React.useState<boolean>(!unresolvableEns.includes(ens))
    useEffect(() => {
        if (unresolvableEns.includes(ens)) {
            setIsRecordsPending(false)
            return
        }
        getResolvableEns(ens).then((res) => {
            setRecords(res)
            setIsRecordsPending(false)
        })
    }, [ens])

    return {records, isRecordsPending: isRecordsPending }
}

export default function App() {
    const wagmiProviderConfig: CreateConfigParameters = {
        chains: [mainnet],
        transports: {
            [mainnet.id]: http(),
        },
        multiInjectedProviderDiscovery: false
    };

    const config = createConfig(wagmiProviderConfig);

    return (
      <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
              <JustWeb3Provider config={{
                  networks: [
                      {
                          chainId:1,
                          // @ts-ignore
                          providerUrl: 'https://eth-mainnet.g.alchemy.com/v2/' + import.meta.env.EXTENSION_PUBLIC_ALCHEMY_KEY,
                      },
                  ],
                  openOnWalletConnect:false
              }}>
                  <SharedProvider>
                      <Profile />
                      <Tweets />
                      <HoverCards />
                      <CheckColor />
                  </SharedProvider>
              </JustWeb3Provider>
          </QueryClientProvider>
      </WagmiProvider>
  )
}

const CheckColor = () => {
    const { color, changeTheme } = useJustWeb3Theme()
    const mounted = useMounted()

    const backgroundColor = React.useRef<string | null>(null)
    const primaryColor = React.useRef<string | null>(null)
    const [primary, setPrimary] = React.useState<string | null>(null)
    const [background, setBackground] = React.useState<string | null>(null)

    const handlePrimaryColor = (color: string) => {
        if (primaryColor.current !== color) {
            primaryColor.current = color
            setPrimary(color)
        }
    }

    const handleBackgroundColor = (color: string) => {
        if (backgroundColor.current !== color) {
            backgroundColor.current = color;
            setBackground(color)
        }
    }
    useEffect(() => {
        if(color.primary !== primary && primary) {
            changeTheme('primary', primary)
        }
    }, [primary,color])

    useEffect(() => {
        if(color.background !== background && background) {
            changeTheme('background', background)
        }
    }, [background,color])

    useEffect(() => {
        const handlePrimaryColorChange = () => {
            let primaryColorGetter = document.querySelector('a[href="/i/keyboard_shortcuts"]')

            if (!primaryColorGetter) {
                return
            }

            const style = primaryColorGetter.getAttribute("style")
            
            if (!style) {
                return
            }

            const colorAttribute = style.match(/color: ([^;]+)/)?.[1]

            if (!colorAttribute) {
                return
            }

            const hslColor = convertToHSL(colorAttribute.trim())

            const justWeb3PrimaryColor =  document.getElementById('justweb3-extension-root')?.querySelector('style')?.innerHTML.match(/--justweb3-primary-color: ([^;]+)/)?.[1]

            if (justWeb3PrimaryColor === hslColor) {
                return
            }

            handlePrimaryColor(hslColor)
        }

        const handleBackgroundColorChange = () => {
            const backgroundGetter = document.body

            if (!backgroundGetter) {
                return
            }

            const style = backgroundGetter.getAttribute("style")

            if (!style) {
                return
            }

            const colorAttribute = style.match(/background-color: ([^;]+)/)?.[1]

            if (!colorAttribute) {
                return
            }

            const hslColor = convertToHSL(colorAttribute.trim())

            handleBackgroundColor(hslColor)
        }

        handlePrimaryColorChange()

        handleBackgroundColorChange()

        const backgroundObserver = new MutationObserver(() => {
                handleBackgroundColorChange()
                handlePrimaryColorChange()

        })

        backgroundObserver.observe(document.body, {
            attributes: true,
            subtree: true,
            childList: true,
        })

        return () => {
            backgroundObserver.disconnect();
        }
    }, [mounted])

    return null
}