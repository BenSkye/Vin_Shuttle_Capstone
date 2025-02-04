'u'

const CarRentalIntro = () => {
    return (
        <div className="car-rental-intro">
            <header>
                <h1>[Your Car Rental Company Name]</h1>
                <p>Your Premier Choice for Car Rentals in Ho Chi Minh City</p>
            </header>

            <section className="overview">
                <p>
                    Welcome to [Your Car Rental Company Name], your gateway to exploring Ho Chi Minh City with freedom and convenience. We offer a diverse fleet of vehicles to cater to every traveler's needs, from solo adventurers to families and business travelers.  Whether you're navigating the bustling city streets or venturing out to explore the surrounding areas, we've got the perfect car for you.
                </p>
                {/* You could add an image carousel or a single hero image here */}
                {/* <img src="/path/to/your/hero-image.jpg" alt="Car Rental Fleet" /> */}
            </section>

            <section className="why-choose-us">
                <h2>Why Choose Us?</h2>
                <ul>
                    <li>
                        <strong>Extensive Fleet:</strong> Choose from a wide selection of vehicles, including compact cars, sedans, SUVs, and more.  We have options to fit every budget and group size.
                    </li>
                    <li>
                        <strong>Competitive Rates:</strong> We offer competitive rental rates and transparent pricing with no hidden fees.  Look out for our special offers and discounts!
                    </li>
                    <li>
                        <strong>Convenient Locations:</strong> Our strategically located offices across Ho Chi Minh City make pick-up and drop-off a breeze.  [Mention specific locations if applicable, e.g., near the airport, in the city center].
                    </li>
                    <li>
                        <strong>Excellent Customer Service:</strong> Our dedicated team is committed to providing exceptional customer service. We're here to assist you with all your car rental needs, from booking to roadside assistance.
                    </li>
                </ul>
            </section>

            <section className="explore-hcmc">
                <h2>Explore Ho Chi Minh City with Ease</h2>
                <p>
                    Renting a car gives you the flexibility to discover Ho Chi Minh City at your own pace. Visit iconic landmarks like the Cu Chi Tunnels, explore the vibrant Ben Thanh Market, or take a scenic drive along the Saigon River.  With a rental car, the possibilities are endless!
                </p>
                {/* Add some images of popular attractions in Ho Chi Minh City */}
            </section>

            <section className="booking">
                <h2>Book Your Car Today</h2>
                <p>Ready to start your adventure?  Book your car rental online today through our easy-to-use booking system, or contact us directly for personalized assistance.</p>
                <button>Book Now</button> {/* Link to your booking page */}
                <p>
                    <strong>Contact Us:</strong><br />
                    [Your Phone Number]<br />
                    [Your Email Address]<br />
                    [Your Website]
                </p>
            </section>

            <footer>
                <p>&copy; {new Date().getFullYear()} [Your Car Rental Company Name]</p>
            </footer>
        </div>
    );
};

export default CarRentalIntro;