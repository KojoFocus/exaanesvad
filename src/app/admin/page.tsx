import LoginForm from './LoginForm';
import styles from './login.module.css';

export const metadata = { title: 'Admin Login' };

export default function AdminLoginPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.box}>
        <div className={styles.logo}>EXA-ANESVAD</div>
        <p className={styles.sub}>Admin dashboard</p>
        <LoginForm />
      </div>
    </div>
  );
}
