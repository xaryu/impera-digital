import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Check, X, Upload, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string | null;
  display_order: number;
};

const fetchTeam = async (): Promise<TeamMember[]> => {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("display_order");
  if (error) throw error;
  return data;
};

const MemberCard = ({
  member,
  isAdmin,
  onSave,
  onDelete,
}: {
  member: TeamMember;
  isAdmin: boolean;
  onSave: (id: string, name: string, role: string, bio: string, photo_url: string | null) => void;
  onDelete: (id: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [role, setRole] = useState(member.role);
  const [bio, setBio] = useState(member.bio || "");
  const [photoUrl, setPhotoUrl] = useState(member.photo_url);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${member.id}.${ext}`;
      const { error } = await supabase.storage
        .from("team-photos")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("team-photos").getPublicUrl(path);
      setPhotoUrl(data.publicUrl + `?t=${Date.now()}`);
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    onSave(member.id, name, role, bio, photoUrl);
    setEditing(false);
  };

  const handleCancel = () => {
    setName(member.name);
    setRole(member.role);
    setBio(member.bio || "");
    setPhotoUrl(member.photo_url);
    setEditing(false);
  };

  return (
    <div className="group relative text-center p-8 border border-border hover:border-gold/30 hover:gold-glow transition-all duration-500 bg-background">
      {/* Photo */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-navy flex items-center justify-center">
            <span className="font-display text-xl font-bold text-gold">
              {initials}
            </span>
          </div>
        )}
        {editing && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-full bg-navy/70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          >
            <Upload className="w-5 h-5 text-gold" />
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* Name & Role */}
      {editing ? (
        <div className="space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-center bg-transparent border-b border-gold/40 focus:border-gold text-navy font-display text-lg font-semibold outline-none pb-1"
          />
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full text-center bg-transparent border-b border-gold/30 focus:border-gold/60 text-muted-foreground font-body text-xs tracking-wider uppercase outline-none pb-1"
          />
          <div className="flex justify-center gap-3 pt-2">
            <button onClick={handleSave} className="p-1 text-gold hover:text-gold-light">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={handleCancel} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-display text-lg font-semibold text-navy mb-1">
            {member.name}
          </h3>
          <p className="font-body text-xs tracking-wider text-gold uppercase mb-3">
            {member.role}
          </p>
          {member.bio && (
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              {member.bio}
            </p>
          )}
        </>
      )}

      {/* Admin controls */}
      {isAdmin && !editing && (
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 bg-background border border-border rounded hover:border-gold/50 text-muted-foreground hover:text-gold transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(member.id)}
            className="p-1.5 bg-background border border-border rounded hover:border-destructive/50 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

const LeadershipSection = ({ isAdmin }: { isAdmin: boolean }) => {
  const queryClient = useQueryClient();

  const { data: team = [], isLoading } = useQuery({
    queryKey: ["team_members"],
    queryFn: fetchTeam,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      name,
      role,
      photo_url,
    }: {
      id: string;
      name: string;
      role: string;
      photo_url: string | null;
    }) => {
      const { error } = await supabase
        .from("team_members")
        .update({ name, role, photo_url })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      toast.success("Member updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      toast.success("Member removed");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("team_members").insert({
        name: "New Member",
        role: "Role",
        display_order: team.length + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      toast.success("Member added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <section className="py-24 bg-cream">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
            The People
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy">
            Leadership
          </h2>
          {isAdmin && (
            <p className="font-body text-xs text-muted-foreground mt-3">
              Hover over a card to edit name, role, or photo.
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-border/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isAdmin={isAdmin}
                onSave={(id, name, role, photo_url) =>
                  updateMutation.mutate({ id, name, role, photo_url })
                }
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
            {isAdmin && (
              <button
                onClick={() => addMutation.mutate()}
                className="flex flex-col items-center justify-center gap-3 p-8 border border-dashed border-gold/30 hover:border-gold/60 text-gold/50 hover:text-gold transition-all duration-300"
              >
                <Plus className="w-8 h-8" />
                <span className="font-body text-xs tracking-wider uppercase">
                  Add Member
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default LeadershipSection;
