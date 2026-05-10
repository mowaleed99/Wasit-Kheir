import { useAuth } from "@/context/AuthContext";
import { useMyReports, extractList } from "@/api";
import { resolveImageUrl } from "@/utils/imageUrl";
import { ReportCard } from "@/components/reports/ReportCard";
import { Mail, Phone, MapPin, Calendar, Edit2, Bookmark, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EditProfileModal } from "@/components/profile/EditProfileModal";

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');
  const { data: myPostsData, isLoading: postsLoading, error: postsError } = useMyReports({ pageSize: 100 });

  // API returns { success, data: { data: [], page, totalPages } }
  const userPosts = extractList(myPostsData);

  // Report type mapping: LostItem/FoundItem/LostPerson/FoundPerson
  const matchesTab = (report: any) => {
    if (activeTab === 'all') return true;
    const t = (report.type || '').toLowerCase();
    if (activeTab === 'lost') return t.startsWith('lost');
    if (activeTab === 'found') return t.startsWith('found');
    return false;
  };
  const filteredPosts = userPosts.filter(matchesTab);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  console.log("Profile User:", user);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* Profile Header */}
      <div className="bg-card text-card-foreground rounded-lg shadow-sm border border-border mb-6">
        <div className="p-4 sm:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
              {/* Avatar */}
              <img
                src={
                  user?.profilePictureUrl
                    ? resolveImageUrl(user.profilePictureUrl)
                    : user?.avatar
                      ? user.avatar
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=3b82f6&color=fff&size=128`
                }
                alt={user?.fullName || "User"}
                className="w-24 h-24 rounded-full object-cover border-4 border-border"
              />

              {/* User Info */}
              <div className="flex flex-col items-center md:items-start">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {user?.fullName || t('profile.unknownUser')}
                </h1>
                <div className="space-y-2">
                  {user?.email && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  )}
                  {user?.phoneNumber && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{user.phoneNumber}</span>
                    </div>
                  )}
                  {user?.address && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{user.address}</span>
                    </div>
                  )}
                  {user?.createdAt && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {t('profile.joined', { date: formatDate(user.createdAt) })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowEditModal(true)}>
                <Edit2 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('profile.editProfile')}
              </Button>
              <Link to="/settings">
                <Button variant="ghost" className="w-full sm:w-auto text-muted-foreground hover:text-foreground">
                  <Settings className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {t('profile.settings')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Bio */}
          {user?.bio && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-muted-foreground">{user.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{userPosts.length}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('profile.totalPosts')}</p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 text-center">
          <p className="text-3xl font-bold text-green-600">
            {userPosts.filter((p: any) => (p.type || '').toLowerCase().startsWith('found')).length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{t('profile.foundItems')}</p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 text-center">
          <p className="text-3xl font-bold text-orange-600">
            {userPosts.filter((p: any) => (p.type || '').toLowerCase().startsWith('lost')).length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{t('profile.lostItems')}</p>
        </div>
        <Link to="/saved-reports" className="bg-card rounded-lg shadow-sm border border-border p-6 text-center hover:border-blue-200/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group">
          <div className="flex justify-center mb-1">
            <Bookmark className="w-7 h-7 text-blue-500 group-hover:text-blue-600 transition-colors" />
          </div>
          <p className="text-sm text-muted-foreground mt-1 font-medium group-hover:text-blue-700 transition-colors">{t('profile.savedReports')}</p>
        </Link>
      </div>

      {/* User's Posts */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h2 className="text-2xl font-bold mb-6 text-foreground">{t('profile.myPosts')}</h2>

        {postsLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('profile.loadingPosts')}</p>
          </div>
        ) : postsError ? (
          <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
            <p className="text-red-600">{t('profile.failedToLoad')}</p>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('profile.noPostsYet')}</p>
            <Link to="/create-report">
              <Button className="mt-4">{t('profile.createFirstReport')}</Button>
            </Link>
          </div>
        ) : (
          <div>
            {/* Tabs */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6 border-b border-border">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t('profile.allPostsTab', { count: userPosts.length })}
              </button>
              <button
                onClick={() => setActiveTab('lost')}
                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'lost'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t('profile.lostItemsTab', { count: userPosts.filter((p: any) => (p.type || '').toLowerCase().startsWith('lost')).length })}
              </button>
              <button
                onClick={() => setActiveTab('found')}
                className={`px-4 py-2 font-medium transition-colors ${activeTab === 'found'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {t('profile.foundItemsTab', { count: userPosts.filter((p: any) => (p.type || '').toLowerCase().startsWith('found')).length })}
              </button>
            </div>

            {/* Posts Display */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {t('profile.noPostsFound', { type: activeTab === 'all' ? '' : activeTab })}
                </div>
              ) : (
                filteredPosts.map((post: any) => (
                  <ReportCard key={post.id} report={post} />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};
