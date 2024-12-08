"use client";

import {
  useRef,
  useState,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import('@/components/pdf-viewer'), {
  ssr: false
});

export default function SignatureElectronique() {
  const [step, setStep] = useState(1);
  const [isSigned, setIsSigned] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [email, setEmail] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsSigned(true);
    }
  };

  const handleChange = (index: number, value: string) => {
    // Accepter uniquement un chiffre par champ
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Si un chiffre est entré, passer automatiquement au suivant
      if (value && index < 5) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Si l'utilisateur appuie sur backspace sans chiffre, reculer d'un champ
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData?.getData("text").slice(0, 6);
    const digits = pastedData?.split("").filter((char) => /^[0-9]$/.test(char));

    const newCode = [...code];
    digits?.forEach((digit, idx) => {
      if (idx < 6) newCode[idx] = digit;
    });
    setCode(newCode);

    // Se positionner sur le dernier champ rempli
    const lastIndex = digits ? Math.min(digits.length, 6) - 1 : -1;
    if (lastIndex >= 0) {
      inputs.current[lastIndex]?.focus();
    }
  };

  async function sendVerificationCode(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const response = await fetch("/api/send-verification-code", {
      method: "POST",
      body: JSON.stringify({ userEmail: email }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      // handleNextStep();
    }
  }

  async function verifyCode(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    // Convertir le tableau de digits en une chaîne
    const codeString = code.join(""); 
  
    const response = await fetch("/api/verify-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userEmail: email, inputCode: codeString }),
    });
    
    if (response.ok) {
      const data = await response.json();
      // setToken(data.token);
      await SendSign(); 
    } else {
      const errorData = await response.json();
      console.error(errorData.message);
    }
  }

  async function getIpAddress() {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  }

  async function SendSign() {
    try {
      const ip = await getIpAddress(); // Vérifie que cette fonction est définie comme dans l'exemple ci-dessus.
      
      // Vérifie que nom, prenom, email, token sont définis
      console.log(nom, prenom, email);
      if (!nom || !prenom || !email) {
        console.error("Certaines informations (nom, prénom, email, token) sont manquantes.");
        return;
      }
  
      const response = await fetch("/api/sign/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nomPrenom: `${nom} ${prenom}`,
          email: email,
          ipAddress: ip,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur du serveur:", errorData);
      } else {
        const data = await response.json();
      }
    } catch (error) {
      console.error("Une erreur s'est produite lors de l'envoi de la signature:", error);
    }
  }
  
  function PreviewAndInfo({ onNext }: { onNext: () => void }) {
    return (
      <div className="space-y-4 w-full">
        <div className="border rounded-lg p-4 bg-white w-full">
          <PDFViewer documentUrl="/Contrat.pdf" userName="John Doe" />
        </div>
        <div className="flex align-items-center gap-3 w-full">
          <div className="space-y-2 w-full lg:w-1/2">
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              placeholder="Votre nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div className="space-y-2 w-full lg:w-1/2">
            <Label htmlFor="prenom">Prénom</Label>
            <Input
              id="prenom"
              placeholder="Votre prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button
          onClick={async (e) => {
            await sendVerificationCode(e);
            onNext();
          }}
          className="w-full"
        >
          Envoyer le code
        </Button>
      </div>
    );
  }

  function CodeValidation({ onNext }: { onNext: () => void }) {
    return (
      <div className="space-y-4">
        <p>
          Un code a été envoyé à votre adresse email. Veuillez le saisir
          ci-dessous afin de confirmer votre signature électroniquement:
        </p>
        {/* <Input placeholder="Code de validation" /> */}
        <div className="mt-2 relative">
          <div className="flex justify-start items-center w-full space-x-3">
            {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
              inputs.current[index] = el;
              if (el && digit === "" && inputs.current.findIndex(input => input === document.activeElement) === -1) {
                el.focus();
              }
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-lg font-semibold border rounded-md dark:bg-background dark:border-foreground dark:text-foreground"
            />
            ))}
          </div>
        </div>
        <Button
          onClick={async (e) => {
            await verifyCode(e);
            onNext();
          }}
          className="w-full bg-green-500 hover:bg-green-600"
        >
          Signer électroniquement
        </Button>
      </div>
    );
  }

  function Confirmation() {
    return (
      <div className="space-y-4 text-center">
        <p className="text-green-600 font-semibold text-left">
          Le document a été signé avec succès !
        </p>
        {/* <a href="#" className="text-blue-500 hover:underline">
          Télécharger le document signé
        </a> */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans p-4">
      <div className="w-full max-w-lg">
      {step === 1 && (
        <>
        <h2 className="text-2xl font-semibold mb-4">Prévisualisation et informations</h2>
        <PreviewAndInfo onNext={handleNextStep} />
        </>
      )}
      {step === 2 && (
        <>
        <h2 className="text-2xl font-semibold mb-4">Signature électronique</h2>
        <CodeValidation onNext={handleNextStep} />
        </>
      )}
      {step === 3 && (
        <>
        <h2 className="text-2xl font-semibold mb-4">Confirmation</h2>
        <Confirmation />
        </>
      )}
      </div>
    </div>
  );
}
