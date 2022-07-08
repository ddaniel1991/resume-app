import Nav from "../components/Navbar/Navbar"
import styles from '../styles/resume.module.css'
import Carousel from '../components/resume/Carousel'
import AboutMeSection from '../components/resume/AboutMeSection'
import 'bootstrap/dist/css/bootstrap.min.css';
import jobHistory from '../workHistory.json'
import { Container } from "react-bootstrap"
import JobHistorySection from "../components/resume/JobHistorySection";

export default function Resume () {
  return (
    <div>
      <header>
        <Container>
        <Carousel />
        <h1 className={styles.sectionHeader}>David A. Daniel</h1>
        </Container>
      </header>
      <section className={styles.sectionConfig}>
        <Container>
          <AboutMeSection />
        </Container>
      </section>
      <section className={styles.sectionConfig}>
        <Container>
          <JobHistorySection jobHistory={jobHistory} />
          
        </Container>
      </section>
      <section className={styles.sectionConfig}>
        <Container>
            <h1 className={styles.sectionHeader}>This is my portfolio</h1>
        </Container>
      </section>
      <section className={styles.sectionConfig}>
        <h1 className={styles.sectionHeader}>This is something else, idk ask ya mammy</h1>
      </section>
    </div>
  )
}

