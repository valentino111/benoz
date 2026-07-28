import { Fragment } from 'react';

const processSteps = [
  ['01', 'כתיבה', 'Writing'],
  ['02', 'יצירת דימוי', 'Visual Creation'],
  ['03', 'מוזיקה', 'Music'],
  ['04', 'קולנוע', 'Film'],
];

const flowSteps = [
  ['רעיון', 'Idea'],
  ['שירה', 'Poetry'],
  ['אמנות', 'Art'],
  ['מוזיקה', 'Music'],
  ['קולנוע', 'Cinema'],
  ['זיכרון', 'Memory'],
];

const timelineItems = [
  {
    year: 'Before',
    titleHe: 'חיפוש',
    titleEn: 'Searching',
    textHe: 'שנים של קולנוע, טכנולוגיה ומוזיקה חיפשו שפה משותפת.',
    textEn: 'Years of cinema, technology and music searched for a common language.',
  },
  {
    year: '2023',
    titleHe: '7 באוקטובר',
    titleEn: 'October 7',
    textHe: 'השבר שינה את היחס לזיכרון, לבית ולמשמעות של יצירה.',
    textEn: 'The rupture changed the relationship to memory, home and the meaning of creation.',
  },
  {
    year: 'Return',
    titleHe: 'חזרה',
    titleEn: 'Return',
    textHe: 'החזרה דרומה הפכה את היצירה לדרך לאסוף מחדש את החלקים.',
    textEn: 'Returning south transformed creation into a way of gathering the fragments again.',
  },
  {
    year: '2026',
    titleHe: 'קול אחד, צורות רבות',
    titleEn: 'One Voice, Many Forms',
    textHe: 'שירה, דימוי, מוזיקה וקולנוע מתכנסים לתערוכה דיגיטלית אחת.',
    textEn: 'Poetry, image, music and film converge into one digital exhibition.',
  },
];

export default function StorySection({ standalone = false }) {
  const Heading = standalone ? 'h1' : 'h2';

  return (
    <section className="story fade" id="story">
      <div className="story-grid">
        <div>
          <div className="story-kicker">
            <span data-lang="he">למה הפרויקט הזה קיים</span>
            <span data-lang="en">Why this project exists</span>
          </div>
          <Heading>
            <span data-lang="he">הסיפור שמאחורי הסדרה</span>
            <span data-lang="en">The Story Behind the Series</span>
          </Heading>
          <div className="story-text">
            <p>
              <span data-lang="he">הפרויקט נולד מתוך שאלה פשוטה: האם רעיון אחד יכול לחיות בו־זמנית כשירה, דימוי, מוזיקה וקולנוע?</span>
              <span data-lang="en">This project was born from a simple question: can one idea live simultaneously as poetry, image, music and film?</span>
            </p>
            <p>
              <span data-lang="he">הסדרה חוקרת יופי, חמלה, יצירה, אהבה ואת אותו סדר נסתר המחבר בין האדם, הטבע והיקום. כל עבודה מתחילה במילים, מקבלת גוף בתמונה, ממשיכה אל הצליל ולבסוף אל התנועה.</span>
              <span data-lang="en">The series explores beauty, compassion, creation, love and the hidden order connecting the human being, nature and the universe. Each work begins in words, takes form as an image, continues into sound and finally into movement.</span>
            </p>
          </div>
          <div className="process-list">
            {processSteps.map(([number, he, en]) => (
              <div key={number}>
                <span>{number}</span>
                <strong><span data-lang="he">{he}</span><span data-lang="en">{en}</span></strong>
              </div>
            ))}
          </div>
        </div>
        <div className="flow">
          {flowSteps.map(([he, en], index) => (
            <Fragment key={en}>
              <div><span data-lang="he">{he}</span><span data-lang="en">{en}</span></div>
              {index < flowSteps.length - 1 && <div className="arrow">↓</div>}
            </Fragment>
          ))}
        </div>
      </div>
      <div aria-label="Creative journey" className="timeline">
        {timelineItems.map((item) => (
          <article className="timeline-item fade" key={item.year}>
            <div className="timeline-year">{item.year}</div>
            <h3><span data-lang="he">{item.titleHe}</span><span data-lang="en">{item.titleEn}</span></h3>
            <p><span data-lang="he">{item.textHe}</span><span data-lang="en">{item.textEn}</span></p>
          </article>
        ))}
      </div>
    </section>
  );
}
