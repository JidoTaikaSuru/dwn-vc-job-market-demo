// import React, { useEffect, useRef, useState } from "react";
// import { AiOutlineClose } from "react-icons/ai";
// import { IoCopyOutline, IoLogOutOutline } from "react-icons/io5";
// import { MdDone } from "react-icons/md";
// import { ethers, formatEther } from "ethers";
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// //@ts-ignore
// import Identicon from "react-identicons";
// import { useWallet } from "~/context/WalletContext";
//
// interface IEmbeddedWalletModal {
//   //   logout: () => void;
//   setIsWalletModal: (val: boolean) => void;
// }
//

//
// const EmbeddedWalletModal: React.FC<IEmbeddedWalletModal> = ({
//   //   logout,
//   setIsWalletModal,
// }) => {
//   //   const { data } = useBalance({
//   //     address: wallet?.address,
//   //   });
//   //   console.log("🚀 ~ file: EmbeddedWalletModal.tsx:33 ~ data:", data);
//
//   const ref = useRef<HTMLDivElement | null>(null);
//   const [balance, setBalance] = useState("0");
//   const [isCopied, setIsCopied] = useState(false);
//   const { address, wallet } = useWallet();
//   const truncatedAddress = truncateAddress(wallet?.address as string);
//   console.log("🚀 ~ file: EmbeddedWalletModal.tsx:38 ~ balance:", address);
//
//   useEffect(() => {
//     const getBalance = async () => {
//       try {
//         if(!address){
//           console.log("Attempted to get balance, but no address found")
//           return
//         }
//         const provider = new ethers.BrowserProvider(window.ethereum);
//
//         const balance = await provider.getBalance(address);
//         console.log(
//           "🚀 ~ file: WalletModal.tsx:49 ~ getBalance ~ balance:",
//           balance,
//         );
//
//         const balanceInEth = formatEther(balance);
//         console.log(
//           "🚀 ~ file: WalletModal.tsx:51 ~ getBalance ~ balanceInEth:",
//           balanceInEth,
//         );
//         setBalance(balanceInEth);
//       } catch (error) {
//         console.error("Error fetching balance:", error);
//       }
//     };
//
//     getBalance();
//   }, [address]);
//
//   useEffect(() => {
//     function handleEvent(event: MouseEvent) {
//       const clickedElement = event.target as HTMLElement;
//       const clickedElementId = clickedElement.id;
//       console.log(
//         "🚀 ~ file: LoginWithEmail.tsx:122 ~ handleEvent ~ clickedElementId:",
//         clickedElementId,
//       );
//
//       if (clickedElementId === "bg") {
//         closeModal();
//       }
//     }
//
//     document.addEventListener("mousedown", handleEvent);
//
//     return () => {
//       document.removeEventListener("mousedown", handleEvent);
//     };
//   }, [ref]);
//
//   const closeModal = () => {
//     setIsWalletModal(false);
//   };
//
//   const copyAddress = () => {
//     navigator.clipboard.writeText(address as string);
//     setIsCopied(true);
//     setTimeout(() => {
//       setIsCopied(false);
//     }, 1200);
//   };
//   return (
//     <div
//       id="bg"
//       ref={ref}
//       className="fixed inset-0 flex  bg-opacity-40 items-center justify-center z-10 divide-y divide-gray-200 bg-[#b2b2b2]"
//     >
//       <div
//         id="modal"
//         className="relative bg-[#f4f4f4] rounded-xl shadow-2xl  drop-shadow-2xl w-96 border-2 h-56"
//       >
//         <AiOutlineClose
//           className="absolute right-6 top-4 cursor-pointer"
//           onClick={closeModal}
//         />
//         <div className="absolute top-12 flex gap-2 w-full flex-col justify-center items-center">
//           <Identicon string={truncatedAddress} size={32} />
//           <div className="flex-col justify-center text-center ">
//             <h1 className="font-bold tracking-lighter text-[#25292e] text-[18px] ">
//               {truncatedAddress}
//             </h1>
//             <h1 className="font-semibold text-[#868989] ">
//               {balance ? balance : "0.0"} ETH
//             </h1>
//           </div>
//         </div>
//         <div className="absolute bottom-4 w-full flex gap-8 justify-center">
//           <button
//             onClick={copyAddress}
//             className="flex flex-col bg-[#fafafa] w-2/5 hover:scale-105 transition duration-200 ease-in-out rounded-lg py-1 justify-center items-center"
//           >
//             {isCopied ? (
//               <>
//                 <MdDone className=" cursor-pointer" size={24} />
//                 <span className="text-xs font-semibold">Copied</span>
//               </>
//             ) : (
//               <>
//                 <IoCopyOutline className=" cursor-pointer" size={24} />
//                 <span className="text-xs font-semibold">Copy Address</span>
//               </>
//             )}
//           </button>
//           <button
//             // onClick={logout}
//             className="flex flex-col bg-[#fafafa] w-2/5 hover:scale-105 transition duration-200 ease-in-out rounded-lg py-1 justify-center items-center"
//           >
//             <IoLogOutOutline className="cursor-pointer" size={24} />
//             <span className="text-xs font-semibold">Disconnect</span>{" "}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default EmbeddedWalletModal;
