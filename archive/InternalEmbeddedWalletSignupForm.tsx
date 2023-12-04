// import type { FC } from "react";
// import ethers, { Wallet } from "ethers";
// import {
//   convertStringToCryptoKey,
//   encryptData,
//   messagePubKeyToParent,
// } from "~/lib/cryptoLib";
// import type { SubmitHandler } from "react-hook-form";
// import { useForm } from "react-hook-form";
// import { supabaseClient } from "~/components/InternalIframeDemo";
// import { TextField } from "@mui/material";
//
// type SignInFormProps = {
//   email: string;
//   encryptionKeyPin: string;
// };
//
// export const InternalEmbeddedWalletSignupForm: FC = () => {
//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<SignInFormProps>();
//
//   const onSubmit: SubmitHandler<SignInFormProps> = async (formData) => {
//     // TODO Check if the user already exists here
//     // let localDevicePrivateKey = devicePrivateKey;
//     // let localWallet = wallet;
//     // if (!localDevicePrivateKey || !wallet) {
//     const newEmbeddedWallet = ethers.Wallet.createRandom();
//     // Setting localStorage will trigger a context update
//     localStorage.setItem("devicepublickey", newEmbeddedWallet.address);
//     localStorage.setItem("deviceprivatekey", newEmbeddedWallet.privateKey);
//     const localDevicePrivateKey = await convertStringToCryptoKey(
//       newEmbeddedWallet.privateKey
//     );
//
//     const localWallet = new Wallet(newEmbeddedWallet.privateKey);
//     console.log(
//       "No device key found on signu[] createing a new one " +
//         newEmbeddedWallet.privateKey
//     );
//     // }
//
//     const privateKeyEncryptionPin = await convertStringToCryptoKey(
//       formData.encryptionKeyPin
//     );
//     const pinEncryptedPrivateKey = encryptData(
//       localWallet.privateKey,
//       privateKeyEncryptionPin
//     ).toString();
//     const deviceEncryptedPrivateKey = encryptData(
//       localWallet.privateKey,
//       localDevicePrivateKey
//     ).toString();
//
//     try {
//       const { data, error } = await supabaseClient.auth.signUp({
//         email: formData.email,
//         password: "WorkAroundForPasswordlessLogin" + Math.random(),
//         options: {
//           data: {
//             pubkey: localWallet.address,
//             pin_encrypted_private_key: pinEncryptedPrivateKey,
//             device_encrypted_private_key: deviceEncryptedPrivateKey,
//           },
//         },
//       });
//
//       if (data) {
//         console.log("signUp data:", data);
//         messagePubKeyToParent("Finished signing up");
//       }
//       if (error) console.log("signUp error:", error);
//     } catch (e) {
//       console.log("singup catch error e:", e);
//     }
//
//     reset();
//   };
//
//   return (
//     <form onSubmit={handleSubmit(onSubmit)}>
//       <TextField
//         {...register("email", { required: true })}
//         label={"Email"}
//         type={"email"}
//         helperText={errors.email?.message}
//         error={!!errors.email}
//       />
//       <TextField
//         {...register("encryptionKeyPin", { required: true })}
//         label={"Encryption Key Pin"}
//         type={"password"}
//         helperText={errors.encryptionKeyPin?.message}
//         error={!!errors.encryptionKeyPin}
//       />
//     </form>
//   );
// };
