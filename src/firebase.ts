import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCBcDtVuYQmViaSw0X1dg4seWT4tBqg098",
  authDomain: "titus-library.firebaseapp.com",
  projectId: "titus-library",
  storageBucket: "titus-library.firebasestorage.app",
  messagingSenderId: "1024599839477",
  appId: "1:1024599839477:web:ffb808a009524c975b6bbc"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

export const ADMIN_UIDS = [
  "jvpnDzUBPqfEfGiGYBoxQLgPBFo2",
  "18r6BWEVMEcpWgDIuBaDnZu8L4s1"
];

export const isAdminUid = (uid?: string | null): boolean => {
  if (!uid) return false;
  return ADMIN_UIDS.includes(uid);
};

export const DEFAULT_SETTINGS = {
  websiteName: "তিতাস লাইব্রেরি",
  description: "তিতাস লাই বিড়ি বাংলাদেশে অন্যতম একটি লাইব্রেরী",
  tagline: "বাংলাদেশে অন্যতম সেরা বই ও শিক্ষা উপকরণের নির্ভরযোগ্য প্রতিষ্ঠান",
  whatsappNumber: "+8801410688372",
  deliveryCharge: 60,
  logoUrl: "https://photos.app.goo.gl/UhLWnquGVfyzB9xk9",
  faviconUrl: "https://photos.app.goo.gl/UhLWnquGVfyzB9xk9",
  heroVideoUrl: "https://player.cloudinary.com/embed/?cloud_name=jfd9ezjq&public_id=VID_20260919_120306_675",
  heroMediaType: "video" as const,
  heroProductIds: {
    left1: "",
    left2: "",
    right1: "",
    right2: ""
  }
};
