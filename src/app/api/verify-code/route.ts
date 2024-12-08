import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
    try {
        const { userEmail, inputCode } = await req.json();
        if (!userEmail || !inputCode) {
            return NextResponse.json({ message: 'Email et code sont requis.' }, { status: 400 });
        }

        const normalizedEmail = userEmail.trim().toLowerCase();

        const client = await clientPromise;
        const db = client.db(process.env.NEXT_DATABASE);
        if (!db) {
            throw new Error('La base de données est introuvable.');
        }

        const verificationCodesCollection = db.collection(process.env.NEXT_TABLE || '');
        if (!verificationCodesCollection) {
            throw new Error('La collection est introuvable.');
        }

        // Vérification du code
        const storedCodeEntry = await verificationCodesCollection.findOne({ email: normalizedEmail });
        
        if (!storedCodeEntry) {
            console.error("Aucun code trouvé pour l'utilisateur :", normalizedEmail);
            return NextResponse.json({ message: 'Aucun code trouvé pour cet utilisateur.' }, { status: 400 });
        }

        const storedCode = storedCodeEntry.code;

        if (storedCode && storedCode === inputCode) {
            // Code correct, générer un token pour la réinitialisation
            const token = crypto.randomBytes(20).toString("hex");
            await verificationCodesCollection.updateOne(
                { email: normalizedEmail },
                { $set: { token, expires: Date.now() + 300000 } }
            ); // Expire dans 5 minutes

            return NextResponse.json({ message: "Code vérifié avec succès", token });
        } else {
            console.error("Code incorrect pour l'utilisateur :", normalizedEmail);
            return NextResponse.json({ message: "Code incorrect" }, { status: 400 });
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du code:', error);
        return NextResponse.json({ message: 'Erreur interne du serveur.' }, { status: 500 });
    }
}