import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import type { materials } from "../lib/client";

type Material = materials.Material;

export function MaterialsPage() {
  const { client, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const load = async () => {
    try {
      const res = await client.materials.list({ limit: 25, offset: 0 });
      setItems(res.materials);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load materials");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", code: "", description: "" });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await client.materials.update(editing.id, {
          name: form.name,
          code: form.code,
          description: form.description || undefined,
        });
      } else {
        await client.materials.create({
          name: form.name,
          code: form.code,
          description: form.description || undefined,
        });
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  const onEdit = (m: Material) => {
    setEditing(m);
    setForm({ name: m.name, code: m.code, description: m.description ?? "" });
  };

  const onDelete = async (id: number) => {
    setError(null);
    try {
      await client.materials.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="page">
      <header className="topbar">
        <h1>Materials</h1>
        <button className="secondary" onClick={onLogout}>
          Log out
        </button>
      </header>

      <p className="muted">
        Reads and writes the real SMILE inventory `materials` table ({total} total rows) — only name, code and
        description are editable here; other reference fields keep sensible defaults.
      </p>

      {error && <p className="error">{error}</p>}

      <form className="card inline-form" onSubmit={onSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          required
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button type="submit">{editing ? "Update" : "Add"}</button>
        {editing && (
          <button type="button" className="secondary" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Description</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.code}</td>
              <td>{m.description}</td>
              <td>{m.status === 1 ? "Active" : "Inactive"}</td>
              <td className="row-actions">
                <button className="secondary" onClick={() => onEdit(m)}>
                  Edit
                </button>
                <button className="danger" onClick={() => onDelete(m.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">
                No materials yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
