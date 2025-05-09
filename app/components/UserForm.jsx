'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UserForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    surname: '',
    birthDate: '',
    photo: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const router = useRouter();

  // Display image preview when a file is selected
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    
    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // Update form state
    setForm({...form, photo: file});
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate form fields
    if (!form.name.trim() || !form.surname.trim() || !form.birthDate || !form.photo) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    try {
      // Create a new FileReader for the image
      const reader = new FileReader();
      reader.readAsDataURL(form.photo);

      reader.onload = async () => {
        try {
          // Extract base64 data without the prefix
          const base64Photo = reader.result.split(',')[1];
          
          const payload = {
            name: form.name.trim(),
            surname: form.surname.trim(),
            birthDate: form.birthDate,
            photo: base64Photo,  // No need to pad - the server can handle this
          };

          const response = await fetch('https://api.busesalman.com/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const result = await response.json();
          
          if (!response.ok) {
            // Extract specific error message if available
            const errorMessage = result.error || 'Failed to submit form';
            throw new Error(errorMessage);
          }

          // Show success and clear form
          setForm({
            name: '',
            surname: '',
            birthDate: '',
            photo: null
          });
          setPhotoPreview(null);
          
          // Call the success callback with the user data
          onSuccess?.(result.user);
          
          // Refresh the page to show updated data
          router.refresh();
        } catch (err) {
          setError(err.message || 'Something went wrong');
        } finally {
          setIsLoading(false);
        }
      };

      // Handle file read errors
      reader.onerror = () => {
        setError('Failed to read the selected image');
        setIsLoading(false);
      };

    } catch (err) {
      setError(err.message || 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            First name
          </label>
          <input
            type="text"
            id="name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
          />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
            Last name
          </label>
          <input
            type="text"
            id="surname"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            value={form.surname}
            onChange={(e) => setForm({...form, surname: e.target.value})}
          />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
            Birth date
          </label>
          <input
            type="date"
            id="birthDate"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            value={form.birthDate}
            onChange={(e) => setForm({...form, birthDate: e.target.value})}
          />
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
            Profile photo
          </label>
          <input
            type="file"
            id="photo"
            accept="image/*"
            required
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            onChange={handlePhotoChange}
          />
          
          {/* Photo preview */}
          {photoPreview && (
            <div className="mt-2">
              <img 
                src={photoPreview} 
                alt="Profile preview" 
                className="h-24 w-24 object-cover rounded-md"
              />
            </div>
          )}
          
          <p className="mt-1 text-xs text-gray-500">
            Görsel boyutu 5MB geçirme
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  )
}