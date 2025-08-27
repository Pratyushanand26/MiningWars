"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormInput, FormTextarea } from '@/components/FormInput';
import { Plus, Loader2 } from 'lucide-react';
import { gsap } from 'gsap';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    metadata: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Animate form on mount
    gsap.fromTo('.register-form', 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Item name must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // TODO: Implement blockchain registration logic
      console.log('Registering item:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form on success
      setFormData({ name: '', description: '', metadata: '' });
      
      // TODO: Show success message and redirect
      alert('Item registered successfully!');
      
    } catch (error) {
      console.error('Registration failed:', error);
      // TODO: Handle registration error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Register New Item</h1>
          <p className="text-gray-300">
            Register your digital asset on the blockchain to establish verifiable ownership
          </p>
        </div>

        <Card className="register-form glass-card border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center">
              <Plus className="w-5 h-5 mr-2 text-purple-400" />
              Item Registration Form
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormInput
                id="name"
                name="name"
                label="Item Name"
                placeholder="Enter a unique name for your item"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                required
                helperText="This will be the public identifier for your asset"
              />

              <FormTextarea
                id="description"
                name="description"
                label="Description"
                placeholder="Describe your item, its purpose, and key features..."
                value={formData.description}
                onChange={handleInputChange}
                error={errors.description}
                required
                helperText="Provide detailed information about your asset"
              />

              <FormTextarea
                id="metadata"
                name="metadata"
                label="Metadata (Optional)"
                placeholder='{"category": "digital-art", "creator": "artist-name", "edition": 1}'
                value={formData.metadata}
                onChange={handleInputChange}
                error={errors.metadata}
                helperText="Additional JSON metadata for your asset"
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 glow-effect"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Register Item
                    </>
                  )}
                </Button>
              </div>

              <div className="text-sm text-gray-400 bg-gray-800/30 p-4 rounded-lg border border-gray-700/50">
                <p className="mb-2 font-semibold">📝 Note:</p>
                <p>
                  Registration requires a connected wallet and will incur gas fees. 
                  Make sure all information is correct before submitting, as it will be permanently recorded on the blockchain.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}