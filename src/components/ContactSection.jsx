export default function ContactSection({ standalone = false }) {
  const Heading = standalone ? 'h1' : 'h2';

  return (
    <section className="contact fade" id="contact">
      <div className="contact-card">
        <div className="contact-role"><span data-lang="he">אמן</span><span data-lang="en">Artist</span></div>
        <div className="contact-name">Ben Oz</div>
        <div className="contact-disciplines">
          <span data-lang="he">אמנות דיגיטלית · מוזיקה · שירה · קולנוע</span>
          <span data-lang="en">Digital Art · Music · Poetry · Film</span>
        </div>
        <Heading>
          <span data-lang="he">לרכישה ולפרטים נוספים</span>
          <span data-lang="en">Purchase and enquiries</span>
        </Heading>
        <div>
          <span data-lang="he">מחיר ארבע העבודות המוצגות יחד: ₪12,000</span>
          <span data-lang="en">Price for the four exhibited works together: ₪12,000</span>
        </div>
        <a className="whatsapp" href="https://wa.me/972544520987" rel="noopener" target="_blank">WhatsApp</a>
      </div>
    </section>
  );
}
