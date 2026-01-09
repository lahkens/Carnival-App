"use client";
import { useLoading } from "../context/LoadingContext";
import styles from "./GlobalLoader.module.css";

export default function GlobalLoader() {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}></div>
    </div>
  );
}
