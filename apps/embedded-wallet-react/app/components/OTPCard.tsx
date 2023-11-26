import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React, { useEffect, useRef, useState } from "react";

interface IOTPCard {}
const initialCode = Array.from({ length: 6 }, () => "");

const OTPCard: React.FC<IOTPCard> = ({}) => {
  const [code, setCode] = useState(initialCode);
  console.log("code", code);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    // Focus on the first input when the component mounts
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const newCode = [...code];
    newCode[index] = value;

    // Move focus to the next input if available
    if (index < inputRefs.current.length - 1 && value !== "") {
      inputRefs.current[index + 1]?.focus();
    }

    setCode(newCode);
  };
  return (
    <Card className="relative bg-white px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
      <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
        <CardHeader className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="font-semibold tracking-tighter text-3xl">
            <p>Email Verification</p>
          </div>
          <div className="flex flex-row text-sm font-medium text-gray-400">
            <p>We have sent a code to your email</p>
          </div>
        </CardHeader>

        <div>
          <form action="" method="post">
            <div className="flex flex-col  space-y-8">
              <div className="flex flex-row gap-4 items-center justify-between ml-[15px] w-full max-w-xs">
                {code.map((digit, index) => (
                  <div key={index} className=" ">
                    <Input
                      ref={(el) => (inputRefs.current[index] = el)}
                      className="w-14 h-14 flex text-center outline-none rounded-xl border border-gray-200 text-xl  focus:bg-gray-50 focus:ring-1 "
                      type="text"
                      name="password"
                      id="code"
                      required
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col space-y-5">
                <div>
                  <Button
                    variant="outline"
                    className="flex flex-row items-center justify-center text-center w-full border rounded-xl outline-none py-5    text-base shadow-sm"
                  >
                    Verify Account
                  </Button>
                </div>

                <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                  <p>Didn't recieve code?</p>{" "}
                  <a
                    className="flex flex-row items-center text-blue-600"
                    href="http://"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Resend
                  </a>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
};
export default OTPCard;
