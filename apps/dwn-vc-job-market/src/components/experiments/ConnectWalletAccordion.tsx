import { FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import { Button } from "@/components/ui/button.tsx";

export const ConnectWalletAccordion: FC = () => {
  return (
    <Accordion type="single" collapsible className="w-full border-none">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          {" "}
          <Button
            variant="outline"
            className="border  font-semibold text-lg tracking-tighter flex items-center justify-center px-8 w-full  rounded-md"
          >
            Connect Wallet
          </Button>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col space-y-2">
          <Button
            variant="outline"
            className="w-full flex justify-between"
            // onClick={connectWallet}
          >
            <div className="flex gap-2">
              <img width={24} height={24} src="/metamask.svg" alt="metamask" />
              <span className="flex-1 text-base font-semibold ms-3 whitespace-nowrap">
                MetaMask
              </span>
            </div>
            <span className="inline-flex items-center justify-center px-2 py-0.5 ms-3 text-xs font-medium text-gray-500 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-400">
              Popular
            </span>
          </Button>
          <Button variant="outline" className="w-full flex justify-between">
            <div className="flex gap-2">
              <img
                width={24}
                height={24}
                src="/coinbase.svg"
                className="rounded-lg"
                alt="coinbase"
              />
              <span className="flex-1 text-base font-semibold ms-3 whitespace-nowrap">
                Coinbase Wallet
              </span>
            </div>
          </Button>
          <Button variant="outline" className="w-full flex justify-between">
            <div className="flex gap-2">
              <img
                width={24}
                height={24}
                src="/wallet-connect.svg"
                className="rounded-lg"
                alt="wallet-connect"
              />
              <span className="flex-1 text-base font-semibold ms-3 whitespace-nowrap">
                WalletConnect
              </span>
            </div>
          </Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
