import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { FiMessageSquare, FiSend, FiChevronDown, FiLock } from "react-icons/fi"
import { useComments, useCreateComment } from "@/hooks/useApi"
import { useAuth } from "@/lib/auth"

export function Comments({ reviewId }: { reviewId: string }) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  const { data, isLoading } = useComments(reviewId)
  const createComment = useCreateComment(reviewId)

  const [open, setOpen] = useState(false)          // collapsed by default — keeps the page short
  const [showGate, setShowGate] = useState(false)  // sign-in-to-comment modal
  const [body, setBody] = useState("")
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const comments = data?.data ?? []

  const submit = async () => {
    setErr(null)
    if (!isAuthenticated || !user) { setShowGate(true); return }
    if (body.trim().length < 3) return setErr("Comment is too short.")
    try {
      await createComment.mutateAsync({
        author_name: user.full_name || user.email,
        author_email: user.email,
        body: body.trim(),
      })
      setDone(true)
      setBody("")
    } catch (e: any) {
      setErr(e?.message || "Could not post your comment.")
    }
  }

  return (
    <section className="border-t border-border pt-10">
      {/* Collapsible header */}
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between group">
        <span className="flex items-center gap-3">
          <FiMessageSquare className="text-primary" size={20} />
          <span className="text-2xl font-archivo font-extrabold uppercase tracking-tight">
            Discussion {comments.length > 0 && <span className="text-muted-foreground">({comments.length})</span>}
          </span>
        </span>
        <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
          {open ? "Hide" : "Show comments"}
          <FiChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open && (
        <div className="mt-8">
          {/* List */}
          {isLoading ? (
            <div className="space-y-4 mb-8">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse border border-border p-5">
                  <div className="h-4 bg-muted/40 w-1/4 mb-3" />
                  <div className="h-3 bg-muted/30 w-3/4" />
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground font-mono mb-8">No comments yet. Be the first to share your thoughts.</p>
          ) : (
            <ul className="space-y-4 mb-10">
              {comments.map((c) => (
                <li key={c.id} className="border border-border p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-archivo font-bold text-sm uppercase tracking-wide">{c.author_name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
                </li>
              ))}
            </ul>
          )}

          {/* Form */}
          {done ? (
            <div className="border border-primary/40 bg-primary/5 p-6">
              <p className="font-archivo font-bold uppercase text-sm mb-1">Thanks — your comment is in review</p>
              <p className="text-sm text-muted-foreground">Comments are moderated before they appear publicly.</p>
            </div>
          ) : (
            <div className="border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">Leave a comment</h3>
                {isAuthenticated && (
                  <span className="text-[11px] font-mono text-muted-foreground">Posting as <span className="text-foreground">{user?.full_name || user?.email}</span></span>
                )}
              </div>

              {/* The box looks normal, but a guest who clicks into it gets the sign-in modal. */}
              <textarea
                className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-primary outline-none mb-4 min-h-[120px]"
                placeholder={isAuthenticated ? "Share your thoughts on this vehicle..." : "Sign in to join the conversation..."}
                value={body}
                readOnly={!isAuthenticated}
                onFocus={() => { if (!isAuthenticated) setShowGate(true) }}
                onChange={(e) => { if (isAuthenticated) setBody(e.target.value) }}
              />
              {err && <p className="text-red-500 text-xs font-mono mb-4">{err}</p>}
              <button
                onClick={submit}
                disabled={createComment.isPending}
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 text-xs font-mono font-black uppercase tracking-[0.2em] hover:bg-foreground transition-colors disabled:opacity-60"
              >
                <FiSend size={14} /> {createComment.isPending ? "Posting..." : "Post comment"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sign-in-to-comment modal (lead generation) */}
      {showGate && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6" onClick={() => setShowGate(false)}>
          <div className="bg-background border border-border w-full max-w-sm p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <FiLock className="mx-auto text-primary mb-4" size={28} />
            <h3 className="text-xl font-archivo font-extrabold uppercase mb-2">Join the conversation</h3>
            <p className="text-sm text-muted-foreground mb-6">Sign in or create a free account to post a comment.</p>
            <div className="flex gap-3">
              <Link to="/signin" state={{ from: location.pathname }} className="flex-1 border border-border py-3 text-xs font-mono font-bold uppercase tracking-widest hover:border-primary transition-colors">Sign in</Link>
              <Link to="/signup" state={{ from: location.pathname }} className="flex-1 bg-primary text-white py-3 text-xs font-mono font-bold uppercase tracking-widest hover:bg-foreground transition-colors">Create account</Link>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}