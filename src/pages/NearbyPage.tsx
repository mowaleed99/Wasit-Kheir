import { useState } from "react";
import { useGetApiReportsNearby } from "@/api";
import { ReportCard } from "@/components/reports/ReportCard";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MapPicker } from "@/components/ui/MapPicker";
import { useTranslation } from "react-i18next";

export const NearbyPage: React.FC = () => {
    const { t } = useTranslation();
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [radius, setRadius] = useState(5); // Default 5km
    const [hasSearched, setHasSearched] = useState(false);

    const { data: nearbyResults, isLoading, refetch } = useGetApiReportsNearby(
        {
            lat: location?.lat,
            lng: location?.lng,
            radius: radius,
        },
        {
            query: { enabled: false }, // Don't auto-fetch
        }
    );

    const results = (nearbyResults as any)?.data?.data || [];

    const handleSearch = () => {
        if (location) {
            setHasSearched(true);
            refetch();
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert(t('nearbyPage.alertCantGetLocation'));
                }
            );
        } else {
            alert(t('nearbyPage.alertGeoNotSupported'));
        }
    };

    return (
        <div className="min-h-screen bg-background pb-12">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">{t('nearbyPage.title')}</h1>
                    <p className="text-muted-foreground text-sm">{t('nearbyPage.subtitle')}</p>
                </div>

                {/* Search Controls */}
                <div className="bg-card text-card-foreground rounded-3xl shadow-sm border border-border p-6 mb-6">
                    <div className="space-y-6">
                        {/* Map */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-3">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                {t('nearbyPage.selectLocation')}
                            </label>
                            <div className="rounded-2xl overflow-hidden border border-border h-96 mb-4">
                                <MapPicker
                                    initialLocation={location || undefined}
                                    onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={getCurrentLocation}
                                className="w-full md:w-auto"
                            >
                                <MapPin className="w-4 h-4 mr-2" />
                                {t('nearbyPage.useCurrentLocation')}
                            </Button>
                        </div>

                        {/* Radius */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                {t('nearbyPage.searchRadius', { radius })}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={radius}
                                onChange={(e) => setRadius(Number(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>1 {t('nearbyPage.km')}</span>
                                <span>50 {t('nearbyPage.km')}</span>
                            </div>
                        </div>

                        {/* Search Button */}
                        <Button
                            onClick={handleSearch}
                            disabled={!location || isLoading}
                            className="w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('nearbyPage.searching')}
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {t('nearbyPage.searchNearby')}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Results */}
                <div>
                    {!hasSearched ? (
                        <div className="text-center py-12 bg-card rounded-3xl border border-border">
                            <MapPin className="w-16 h-16 text-muted mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                {t('nearbyPage.selectLocationFirst')}
                            </h3>
                            <p className="text-muted-foreground">
                                {t('nearbyPage.chooseLocationPrompt')}
                            </p>
                        </div>
                    ) : isLoading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-muted-foreground">{t('nearbyPage.searchingNearby')}</p>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-12 bg-card rounded-3xl border border-border">
                            <MapPin className="w-16 h-16 text-muted mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                {t('nearbyPage.noNearbyPosts')}
                            </h3>
                            <p className="text-muted-foreground">
                                {t('nearbyPage.tryIncreasingRadius')}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-muted-foreground">
                                    {t('nearbyPage.foundPosts', { count: results.length, radius })}
                                </p>
                            </div>
                            <div className="space-y-4">
                                {results.map((post: any) => (
                                    <ReportCard key={post.id} report={post} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
