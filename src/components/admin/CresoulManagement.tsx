import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CresoulImage {
  id: number;
  link: string;
  expiry: string;
}

const CresoulManagement: React.FC = () => {
  const [images, setImages] = useState<CresoulImage[]>([
    { id: 1, link: '/creosol/1.jpg', expiry: '2025-12-31' },
    { id: 2, link: '/creosol/2.jpg', expiry: '2025-12-31' },
  ]);
  const [newLink, setNewLink] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editLink, setEditLink] = useState('');
  const [editExpiry, setEditExpiry] = useState('');

  const handleAdd = () => {
    if (!newLink || !newExpiry) return;
    setImages([...images, { id: Date.now(), link: newLink, expiry: newExpiry }]);
    setNewLink('');
    setNewExpiry('');
  };

  const handleDelete = (id: number) => {
    setImages(images.filter(img => img.id !== id));
  };

  const handleEdit = (img: CresoulImage) => {
    setEditId(img.id);
    setEditLink(img.link);
    setEditExpiry(img.expiry);
  };

  const handleEditSave = () => {
    if (editId === null) return;
    setImages(images.map(img => img.id === editId ? { ...img, link: editLink, expiry: editExpiry } : img));
    setEditId(null);
    setEditLink('');
    setEditExpiry('');
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-4">Cresoul Image Management</h2>
      <div className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-2">Add New Cresoul Image</h3>
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <Input
            placeholder="Image Link (URL or /creosol/...)"
            value={newLink}
            onChange={e => setNewLink(e.target.value)}
          />
          <Input
            type="date"
            placeholder="Expiry Date"
            value={newExpiry}
            onChange={e => setNewExpiry(e.target.value)}
          />
          <Button onClick={handleAdd}>Add</Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="p-2 text-left">Image</th>
              <th className="p-2 text-left">Link</th>
              <th className="p-2 text-left">Expiry</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {images.map(img => (
              <tr key={img.id} className="border-t">
                <td className="p-2">
                  <img src={img.link} alt="cresoul" className="w-24 h-16 object-cover rounded" />
                </td>
                <td className="p-2 break-all">{editId === img.id ? (
                  <Input value={editLink} onChange={e => setEditLink(e.target.value)} />
                ) : img.link}</td>
                <td className="p-2">{editId === img.id ? (
                  <Input type="date" value={editExpiry} onChange={e => setEditExpiry(e.target.value)} />
                ) : img.expiry}</td>
                <td className="p-2">
                  {editId === img.id ? (
                    <>
                      <Button size="sm" onClick={handleEditSave} className="mr-2">Save</Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => handleEdit(img)} className="mr-2">Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(img.id)}>Delete</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CresoulManagement; 