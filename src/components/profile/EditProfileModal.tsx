import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePutApiUsersMe, usePostApiUsersMeProfilePicture } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Camera, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "react-i18next";

const editProfileSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    bio: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditProfileModalProps {
    user: any;
    isOpen: boolean;
    onClose: () => void;
}

export const EditProfileModal = ({ user, isOpen, onClose }: EditProfileModalProps) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { mutate: updateProfile, isPending } = usePutApiUsersMe();
    const { mutate: uploadProfilePicture, isPending: isUploadingPhoto } = usePostApiUsersMeProfilePicture();

    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EditProfileFormData>({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            fullName: user?.fullName || "",
            phoneNumber: user?.phoneNumber || "",
            address: user?.address || "",
            bio: user?.bio || "",
            dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
            gender: user?.gender || "",
        },
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedPhoto(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setSelectedPhoto(null);
        setPhotoPreview(null);
    };

    const onSubmit = (data: EditProfileFormData) => {
        const formData: any = {
            FullName: data.fullName,
        };

        if (data.phoneNumber) formData.Phone = data.phoneNumber;
        if (data.dateOfBirth) formData.DateOfBirth = data.dateOfBirth;
        if (data.gender) formData.Gender = data.gender;

        console.log("Submitting profile update:", formData);

        // First update the profile
        updateProfile(
            { data: formData },
            {
                onSuccess: () => {
                    // If there's a photo to upload, upload it
                    if (selectedPhoto) {
                        uploadProfilePicture(
                            { data: { file: selectedPhoto } },
                            {
                                onSuccess: () => {
                                    queryClient.invalidateQueries({ queryKey: ["/api/Users/me"] });
                                    onClose();
                                },
                                onError: (error: any) => {
                                    console.error("Failed to upload profile picture:", error);
                                    const errorMessage = error?.response?.data?.message
                                        || error?.response?.data?.title
                                        || error?.message
                                        || "Failed to upload profile picture";
                                    alert(`Profile updated but photo upload failed: ${errorMessage}`);
                                    queryClient.invalidateQueries({ queryKey: ["/api/Users/me"] });
                                    onClose();
                                },
                            }
                        );
                    } else {
                        queryClient.invalidateQueries({ queryKey: ["/api/Users/me"] });
                        onClose();
                    }
                },
                onError: (error: any) => {
                    console.error("Failed to update profile:", error);
                    const errorMessage = error?.response?.data?.message
                        || error?.response?.data?.title
                        || error?.message
                        || "Failed to update profile";
                    alert(`Failed to update profile: ${errorMessage}`);
                },
            }
        );
    };

    if (!isOpen) return null;

    const profilePic = user?.profilePictureUrl ? (user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `https://wasitkheir.runasp.net${user.profilePictureUrl}`) : null;
    const currentPhoto = photoPreview || profilePic || user?.avatar;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card text-card-foreground rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between rounded-t-3xl z-10">
                    <h2 className="text-2xl font-bold text-foreground">{t('editProfile.title')}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-muted-foreground" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Profile Photo */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-border bg-muted">
                                {currentPhoto ? (
                                    <img
                                        src={currentPhoto}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                                        <User className="w-16 h-16 text-white" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                                <Camera className="w-5 h-5 text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                            </label>
                        </div>
                        {selectedPhoto && (
                            <button
                                type="button"
                                onClick={removePhoto}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                {t('editProfile.removePhoto')}
                            </button>
                        )}
                    </div>

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            {t('editProfile.fullName')}
                        </label>
                        <input
                            {...register("fullName")}
                            type="text"
                            className="w-full px-4 py-3 bg-background text-foreground border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-muted-foreground"
                            placeholder={t('editProfile.fullNamePlaceholder')}
                        />
                        {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            {t('editProfile.phoneNumber')}
                        </label>
                        <input
                            {...register("phoneNumber")}
                            type="tel"
                            className="w-full px-4 py-3 bg-background text-foreground border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-muted-foreground"
                            placeholder={t('editProfile.phoneNumberPlaceholder')}
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            {t('editProfile.address')}
                        </label>
                        <input
                            {...register("address")}
                            type="text"
                            className="w-full px-4 py-3 bg-background text-foreground border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-muted-foreground"
                            placeholder={t('editProfile.addressPlaceholder')}
                        />
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            {t('editProfile.dateOfBirth')}
                        </label>
                        <input
                            {...register("dateOfBirth")}
                            type="date"
                            className="w-full px-4 py-3 bg-background text-foreground border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            {t('editProfile.gender')}
                        </label>
                        <select
                            {...register("gender")}
                            className="w-full px-4 py-3 bg-background text-foreground border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">{t('editProfile.selectGender')}</option>
                            <option value="Male">{t('editProfile.male')}</option>
                            <option value="Female">{t('editProfile.female')}</option>
                            <option value="Other">{t('editProfile.other')}</option>
                        </select>
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            {t('editProfile.bio')}
                        </label>
                        <textarea
                            {...register("bio")}
                            rows={4}
                            className="w-full px-4 py-3 bg-background text-foreground border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-muted-foreground"
                            placeholder={t('editProfile.bioPlaceholder')}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isPending || isUploadingPhoto}
                        >
                            {t('editProfile.cancel')}
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isPending || isUploadingPhoto}>
                            {isPending || isUploadingPhoto ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin rtl:ml-2 rtl:mr-0" />
                                    {isUploadingPhoto ? t('editProfile.uploadingPhoto') : t('editProfile.updating')}
                                </>
                            ) : (
                                t('editProfile.updateBtn')
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
