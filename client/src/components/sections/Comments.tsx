import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { FiMessageSquare, FiSend, FiChevronDown, FiLock, FiHeart, FiCornerDownRight, FiX, FiLoader } from "react-icons/fi"
import { useComments, useCreateComment, useToggleCommentLike } from "@/hooks/useApi"
import { useAuth } from "@/lib/auth"

export function Comments({ reviewId, featuredImage }: { reviewId: string, featuredImage?: string }) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  const { data, isLoading } = useComments(reviewId)
  const createComment = useCreateComment(reviewId)
  const toggleLike = useToggleCommentLike(reviewId)

  const [open, setOpen] = useState(true)           // expanded by default
  const [showGate, setShowGate] = useState(false)  // sign-in-to-comment modal
  const [body, setBody] = useState("")
  const [replyBody, setReplyBody] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
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

  const submitReply = async (parentId: string) => {
    setErr(null)
    if (!isAuthenticated || !user) { setShowGate(true); return }
    if (replyBody.trim().length < 3) return setErr("Reply is too short.")
    try {
      await createComment.mutateAsync({
        author_name: user.full_name || user.email,
        author_email: user.email,
        body: replyBody.trim(),
        parent_id: parentId
      })
      setReplyingTo(null)
      setReplyBody("")
    } catch (e: any) {
      setErr(e?.message || "Could not post your reply.")
    }
  }

  const handleLike = (commentId: string) => {
    if (!isAuthenticated) return setShowGate(true)
    toggleLike.mutate(commentId)
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
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{c.body}</p>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-4 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                    <button disabled={toggleLike.isPending && toggleLike.variables === c.id} onClick={() => handleLike(c.id)} className={`inline-flex items-center gap-1.5 transition-colors ${(c.likes?.length ?? 0) > 0 ? 'text-primary' : 'hover:text-foreground'} disabled:opacity-50`}>
                      {toggleLike.isPending && toggleLike.variables === c.id ? <FiLoader size={14} className="animate-spin" /> : <FiHeart size={14} className={(c.likes?.length ?? 0) > 0 ? 'fill-primary' : ''} />} {c._count?.likes || 'Like'}
                    </button>
                    <button onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyBody("") }} className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                      <FiCornerDownRight size={14} /> Reply
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === c.id && (
                    <div className="mt-4 border-t border-border pt-4">
                      <textarea
                        className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-primary outline-none mb-3 min-h-[80px] resize-none"
                        placeholder={isAuthenticated ? "Write a reply..." : "Sign in to reply..."}
                        value={replyBody}
                        readOnly={!isAuthenticated}
                        onFocus={() => { if (!isAuthenticated) setShowGate(true) }}
                        onChange={(e) => { if (isAuthenticated) setReplyBody(e.target.value) }}
                      />
                      <button onClick={() => submitReply(c.id)} disabled={createComment.isPending && createComment.variables?.parent_id === c.id} className="bg-primary text-white px-4 py-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] hover:bg-foreground transition-colors disabled:opacity-60 inline-flex items-center gap-2">
                        {createComment.isPending && createComment.variables?.parent_id === c.id ? <><FiLoader size={12} className="animate-spin" /> Posting...</> : "Post Reply"}
                      </button>
                    </div>
                  )}

                  {/* Replies List */}
                  {c.replies && c.replies.length > 0 && (
                    <ul className="mt-6 space-y-4 border-l-2 border-border/40 pl-4 md:pl-6">
                      {c.replies.map(r => (
                        <li key={r.id} className="pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-archivo font-bold text-sm uppercase tracking-wide">{r.author_name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{r.body}</p>
                          <div className="flex items-center gap-4 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                            <button disabled={toggleLike.isPending && toggleLike.variables === r.id} onClick={() => handleLike(r.id)} className={`inline-flex items-center gap-1.5 transition-colors ${(r.likes?.length ?? 0) > 0 ? 'text-primary' : 'hover:text-foreground'} disabled:opacity-50`}>
                              {toggleLike.isPending && toggleLike.variables === r.id ? <FiLoader size={14} className="animate-spin" /> : <FiHeart size={14} className={(r.likes?.length ?? 0) > 0 ? 'fill-primary' : ''} />} {r._count?.likes || 'Like'}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Form */}
          {done ? (
            <div className="border border-green-500/40 bg-green-500/10 p-6">
              <p className="font-archivo font-bold uppercase text-green-600 text-sm mb-1">Thanks — your comment is in review</p>
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
                className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-primary outline-none mb-4 min-h-[120px] resize-none"
                placeholder={isAuthenticated ? "Share your thoughts on this vehicle..." : "Sign in to join the conversation..."}
                value={body}
                readOnly={!isAuthenticated}
                onFocus={() => { if (!isAuthenticated) setShowGate(true) }}
                onChange={(e) => { if (isAuthenticated) setBody(e.target.value) }}
              />
              {err && <p className="text-red-500 text-xs font-mono mb-4">{err}</p>}
              <button
                onClick={submit}
                disabled={createComment.isPending && !createComment.variables?.parent_id}
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 text-xs font-mono font-black uppercase tracking-[0.2em] hover:bg-foreground transition-colors disabled:opacity-60"
              >
                {createComment.isPending && !createComment.variables?.parent_id ? <FiLoader size={14} className="animate-spin" /> : <FiSend size={14} />} 
                {createComment.isPending && !createComment.variables?.parent_id ? "Posting..." : "Post comment"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sign-in-to-comment modal */}
      {showGate && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm" onClick={() => setShowGate(false)}>
          <div className="relative overflow-hidden bg-zinc-900 border border-white/10 w-full max-w-md p-8 md:p-10 shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            
            {/* Background Image Reveal with Special Effect */}
            <div className="absolute top-0 left-0 w-full h-[65%] lg:h-full lg:w-[65%] z-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-900/80 to-zinc-900 z-10" />
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-transparent to-zinc-900 z-10" />
              <img 
                src={featuredImage || "/detail-one.jpg"}
                alt="Modal Background" 
                className="w-full h-full object-cover opacity-40 grayscale mix-blend-lighten" 
              />
            </div>

            <div className="relative z-10">
              <div className="flex justify-end mb-2">
                 <button className="text-white/60 hover:text-white transition-colors" onClick={() => setShowGate(false)}><FiX size={20} /></button>
              </div>
              <FiLock className="mx-auto text-primary mb-6" size={32} />
              <h3 className="text-2xl font-archivo font-extrabold uppercase tracking-tight text-white mb-3">Join the conversation</h3>
              <p className="text-sm text-white/60 mb-8">Sign in or create a free account to post a comment.</p>
              <div className="flex flex-col gap-3">
                <Link to="/signin" state={{ from: location.pathname }} className="w-full border border-white/10 text-white py-4 text-xs font-mono font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">Sign in</Link>
                <Link to="/signup" state={{ from: location.pathname }} className="w-full bg-primary text-white py-4 text-xs font-mono font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">Create account</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}