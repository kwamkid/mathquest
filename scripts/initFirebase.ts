// scripts/initFirebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as readline from 'readline';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Registration codes to create
const registrationCodes = [
  {
    id: 'DEMO2024',
    code: 'DEMO2024',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    maxUses: 100,
    currentUses: 0,
    isActive: true,
    description: 'Demo code for testing'
  },
  {
    id: 'MATHQUEST2024',
    code: 'MATHQUEST2024',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    maxUses: 50,
    currentUses: 0,
    isActive: true,
    description: 'General registration code'
  },
  {
    id: 'SCHOOL2024',
    code: 'SCHOOL2024',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    maxUses: 200,
    currentUses: 0,
    isActive: true,
    description: 'School registration code'
  }
];

async function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer.toLowerCase());
    });
  });
}

async function initializeFirebase() {
  console.log('🚀 Starting Firebase initialization...\n');

  try {
    // Check if already initialized
    const existingCodes = await getDocs(collection(db, 'registrationCodes'));
    if (!existingCodes.empty) {
      console.log('⚠️  Registration codes already exist. Skipping to avoid duplicates.');
      console.log('Existing codes:');
      existingCodes.forEach(doc => {
        console.log(`  - ${doc.id}`);
      });
      
      const response = await askQuestion('\nDo you want to overwrite? (y/N): ');

      if (response !== 'y') {
        console.log('❌ Initialization cancelled.');
        process.exit(0);
        return;
      }
    }

    // Create registration codes
    console.log('📝 Creating registration codes...\n');
    
    for (const codeData of registrationCodes) {
      await setDoc(doc(db, 'registrationCodes', codeData.id), codeData);
      console.log(`✅ Created code: ${codeData.code}`);
      console.log(`   - Max uses: ${codeData.maxUses}`);
      console.log(`   - Description: ${codeData.description}\n`);
    }

    console.log('🎉 Firebase initialization completed successfully!\n');
    console.log('You can now use these registration codes:');
    registrationCodes.forEach(code => {
      console.log(`  - ${code.code}: ${code.description}`);
    });

  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run the initialization
initializeFirebase();