import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toursAPI } from '../../services/api';

const AgentTourList = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchB2BTours();
    }, []);

    const fetchB2BTours = async () => {
        try {
            setLoading(true);
            const data = await toursAPI.getAll('tourType=B2B&status=Active');
            setTours(data);
        } catch (err) {
            setError(err.message || 'Failed to load tours');
        } finally {
            setLoading(false);
        }
    };

    const calculatePriceRange = (tour) => {
        if (!tour.flightVariants?.length || !tour.hotelRoomTypes?.length) {
            return null;
        }

        const nights = tour.nightsFrom || 7;

        // Min/Max flight prices
        const outbounds = tour.flightVariants.filter(f => f.type === 'outbound');
        const returns = tour.flightVariants.filter(f => f.type === 'return');

        if (!outbounds.length || !returns.length) return null;

        const minOutbound = Math.min(...outbounds.map(f => f.price));
        const maxOutbound = Math.max(...outbounds.map(f => f.price));
        const minReturn = Math.min(...returns.map(f => f.price));
        const maxReturn = Math.max(...returns.map(f => f.price));

        // Min/Max room prices
        const minRoom = Math.min(...tour.hotelRoomTypes.map(r => r.pricePerNight));
        const maxRoom = Math.max(...tour.hotelRoomTypes.map(r => r.pricePerNight));

        // Base services total
        const baseTotal = (tour.baseServices || []).reduce((sum, s) => sum + s.fixedCost, 0);

        // Calculate min and max subtotals
        const minSubtotal = minOutbound + minReturn + (minRoom * nights) + baseTotal;
        const maxSubtotal = maxOutbound + maxReturn + (maxRoom * nights) + baseTotal;

        // Apply agent markup
        let minMarkup = 0;
        let maxMarkup = 0;

        if (tour.agentMarkup) {
            if (tour.agentMarkup.type === 'FIXED') {
                minMarkup = tour.agentMarkup.value;
                maxMarkup = tour.agentMarkup.value;
            } else if (tour.agentMarkup.type === 'PERCENT') {
                minMarkup = (minSubtotal * tour.agentMarkup.value) / 100;
                maxMarkup = (maxSubtotal * tour.agentMarkup.value) / 100;
            }
        }

        return {
            min: Math.round(minSubtotal + minMarkup),
            max: Math.round(maxSubtotal + maxMarkup)
        };
    };

    if (loading) {
        return (
            <div className="container-fluid p-4">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3"></div>
                    <p className="text-muted">Loading B2B tours...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid p-4">
                <div className="alert alert-danger">
                    <i className="fa fa-exclamation-circle me-2"></i>{error}
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold m-0">B2B Tour Packages</h3>
                    <p className="text-muted small mb-0">Browse and select tours for your clients</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary-subtle text-primary px-3 py-2">
                        {tours.length} Available Tours
                    </span>
                </div>
            </div>

            {tours.length === 0 ? (
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                    <i className="fa fa-suitcase-rolling text-muted fs-1 mb-3 opacity-25"></i>
                    <h5 className="fw-bold mb-2">No B2B Tours Available</h5>
                    <p className="text-muted">Check back later for new tour packages.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {tours.map(tour => {
                        const priceRange = calculatePriceRange(tour);
                        const tourImage = tour.images?.[0]
                            ? (tour.images[0].startsWith('http') ? tour.images[0] : `http://localhost:5000${tour.images[0]}`)
                            : '/assets/img/package-1.jpg';

                        return (
                            <div className="col-lg-4 col-md-6" key={tour._id}>
                                <Link to={`/agent/tours/${tour._id}`} className="text-decoration-none">
                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 hover-card">
                                        <div className="position-relative">
                                            <img
                                                src={tourImage}
                                                alt={tour.title}
                                                className="card-img-top"
                                                style={{ height: '200px', objectFit: 'cover' }}
                                            />
                                            <div className="position-absolute top-0 end-0 p-3">
                                                <span className="badge bg-warning text-dark">
                                                    <i className="fa fa-briefcase me-1"></i>B2B
                                                </span>
                                            </div>
                                            {tour.isPromotion && (
                                                <div className="position-absolute top-0 start-0 p-3">
                                                    <span className="badge bg-danger">
                                                        <i className="fa fa-fire me-1"></i>Promo
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-body p-4">
                                            <h5 className="card-title fw-bold mb-2">{tour.title}</h5>
                                            <p className="text-muted small mb-3">
                                                <i className="fa fa-route me-2"></i>
                                                {tour.fromCity} → {tour.toCity}
                                            </p>

                                            <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                                                <div>
                                                    <small className="text-muted d-block">Nights</small>
                                                    <span className="fw-bold">{tour.nightsFrom}-{tour.nightsTill}</span>
                                                </div>
                                                <div>
                                                    <small className="text-muted d-block">Category</small>
                                                    <span className="fw-bold">{tour.category}★</span>
                                                </div>
                                                <div>
                                                    <small className="text-muted d-block">Meal</small>
                                                    <span className="fw-bold">{tour.mealType || 'N/A'}</span>
                                                </div>
                                            </div>

                                            <div className="row g-2 mb-3">
                                                <div className="col-6">
                                                    <div className="bg-light rounded-3 p-2 text-center">
                                                        <small className="text-muted d-block x-small">Flight Options</small>
                                                        <span className="fw-bold">{tour.flightVariants?.length || 0}</span>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="bg-light rounded-3 p-2 text-center">
                                                        <small className="text-muted d-block x-small">Room Types</small>
                                                        <span className="fw-bold">{tour.hotelRoomTypes?.length || 0}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="d-flex justify-content-between align-items-end">
                                                <div>
                                                    <small className="text-muted d-block">Price Range</small>
                                                    {priceRange ? (
                                                        <div className="fw-bold text-primary fs-5">
                                                            ${priceRange.min} - ${priceRange.max}
                                                        </div>
                                                    ) : (
                                                        <div className="text-muted small">Configure to see price</div>
                                                    )}
                                                    <small className="text-muted x-small">per person</small>
                                                </div>
                                                <button className="btn btn-primary btn-sm rounded-pill px-3">
                                                    View Details
                                                    <i className="fa fa-arrow-right ms-2"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                .hover-card {
                    transition: all 0.3s ease;
                }
                .hover-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
                }
                .text-primary { color: #30c39e !important; }
                .bg-primary { background-color: #30c39e !important; }
                .bg-primary-subtle { background-color: rgba(48, 195, 158, 0.1) !important; }
                .btn-primary { background-color: #30c39e; border-color: #30c39e; }
                .btn-primary:hover { background-color: #28a686; border-color: #28a686; }
                .x-small { font-size: 11px; }
            `}</style>
        </div>
    );
};

export default AgentTourList;
