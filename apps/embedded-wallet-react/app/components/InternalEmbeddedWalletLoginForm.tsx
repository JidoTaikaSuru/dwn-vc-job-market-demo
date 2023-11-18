import type {FC} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {supabaseClient} from "~/components/InternalIframeDemo";
import {useState} from "react";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;

type InitializeLoginFormProps = {
    email: string;
};
type VerifyOtpFormProps = {
    email: string;
    otp: string;
};


export const InternalEmbeddedWalletLoginForm: FC = () => {
    const [initializeLoginEmail, setInitializeLoginEmail] = useState("");
    const {
        register: initializeLoginRegister,
        handleSubmit: initializeLoginHandleSubmit,
        formState: {
            errors: initializeLoginErrors,
        },
    } = useForm<InitializeLoginFormProps>();
    const {
        register: verifyOtpRegister,
        handleSubmit: verifyOtpHandleSubmit,
        formState: {
            errors: verifyOtpErrors,
        },
    } = useForm<VerifyOtpFormProps>();

    const [initializedLogin, setInitializedLogin] = useState(false)
    const initializeLoginSubmit: SubmitHandler<InitializeLoginFormProps> = async (formData) => {
        const {data, error} = await supabaseClient.auth.signInWithOtp({
            //This also signs up users if they have not yet created an account.
            email: formData.email,
            options: {
                shouldCreateUser: false,
            }
            //password:document.getElementById('login-password').value,  //we will use the password for encrypting like the pin before
        });
        console.log("start login data", data)
        console.log("start login errors", error)
        setInitializedLogin(true)
        setInitializeLoginEmail(formData.email);
    }

    const verifyOtpSubmit: SubmitHandler<VerifyOtpFormProps> = async (formData) => {
        try {
            const {
                data: {session},
                error,
            } = await supabaseClient.auth.verifyOtp({
                email: initializeLoginEmail,
                token: formData.otp,
                type: "email",
            });

            console.log("Session", session)
            console.log("Session errors")
            if (session) {


                console.log(" supabase.auth.verifyOtp() data=", session);
                await checkLoginStatus();
            }
            if (error) console.log(" supabase.auth.verifyOtp() error=", error);
        } catch (e) {
            console.log(" supabase.auth.verifyOtp() catch e=", e);
        }
    }




emailotp.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        try {

            if (session) {
                console.log(" supabase.auth.verifyOtp() data=", session);

                await checkLoginStatus();
            }
            if (error) console.log(" supabase.auth.verifyOtp() error=", error);
        } catch (e) {
            console.log(" supabase.auth.verifyOtp() catch e=", e);
        }
    },
    false
);
return initializedLogin
    ? (
        <form onSubmit={handleSubmit(initializeLoginSubmit)}>
        </form>
    ) : (<form onSubmit={handleSubmit(initializeLoginSubmit)}>
}
;
