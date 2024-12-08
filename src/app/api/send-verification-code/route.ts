import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import clientPromise from '@/lib/mongodb';

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Génère un code numérique de 6 chiffres
}

export async function POST(req: NextRequest) {
  const { userEmail, inputCode } = await req.json();
  const normalizedEmail = userEmail.trim().toLowerCase();

  const client = await clientPromise;
  const db = client.db(process.env.NEXT_DATABASE);
  const verificationCodesCollection = db.collection(process.env.NEXT_TABLE || '');


    // Envoi du code de vérification par e-mail
  
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expire dans 5 minutes

    // Enregistrer le code dans la collection verificationCodes
    await verificationCodesCollection.updateOne(
        { email: normalizedEmail },
        { $set: { code, expiresAt } },
        { upsert: true } // Crée un nouveau document si aucun document ne correspond à la requête
    );

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NEXT_EMAIL,
            pass: process.env.NEXT_PASS,
        },
    });

    const mailOptions = {
        from: process.env.NEXT_EMAIL,
        to: normalizedEmail,
        subject: 'Code de vérification',
        text: `Votre code de vérification est : ${code}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: 'Email envoyé avec succès' });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'e-mail", error);
        return NextResponse.json({ message: "Erreur lors de l'envoi de l'email" }, { status: 500 });
    }
    
}