import { useState, type FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AdminAPI, type AdminProperty, type PropertyInput } from "@/api/admin"
import { useAuthStore } from "@/stores/authStore"

const emptyProperty: PropertyInput = {
  title: "",
  description: "",
  address: "",
  city: "",
  type: "APARTMENT",
  amenities: [],
  latitude: 6.9271,
  longitude: 79.8612,
  imageUrl: "",
  minStay: "1 month",
  isActive: true,
}

function money(value: number | string) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export function AdminDashboard() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const [editing, setEditing] = useState<AdminProperty | null>(null)
  const [form, setForm] = useState<PropertyInput>(emptyProperty)
  const [amenities, setAmenities] = useState("")
  const [message, setMessage] = useState("")

  const summary = useQuery({ queryKey: ["admin", "summary"], queryFn: AdminAPI.summary })
  const properties = useQuery({ queryKey: ["admin", "properties"], queryFn: AdminAPI.properties })
  const bookings = useQuery({ queryKey: ["admin", "bookings"], queryFn: AdminAPI.bookings })

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin"] })
    await queryClient.invalidateQueries({ queryKey: ["properties"] })
  }

  const saveProperty = useMutation({
    mutationFn: (input: PropertyInput) =>
      editing ? AdminAPI.updateProperty(editing.id, input) : AdminAPI.createProperty(input),
    onSuccess: async () => {
      setMessage(editing ? "Property updated." : "Property created.")
      setEditing(null)
      setForm(emptyProperty)
      setAmenities("")
      await refresh()
    },
    onError: (error: Error) => setMessage(error.message),
  })

  const removeProperty = useMutation({
    mutationFn: AdminAPI.deleteProperty,
    onSuccess: refresh,
    onError: (error: Error) => setMessage(error.message),
  })

  function startEdit(property: AdminProperty) {
    setEditing(property)
    setForm({
      title: property.title,
      description: property.description,
      address: property.address,
      city: property.city,
      type: property.type,
      amenities: property.amenities,
      latitude: property.latitude,
      longitude: property.longitude,
      imageUrl: property.imageUrl,
      minStay: property.minStay,
      isActive: property.isActive,
    })
    setAmenities(property.amenities.join(", "))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function submitProperty(event: FormEvent) {
    event.preventDefault()
    setMessage("")
    saveProperty.mutate({
      ...form,
      amenities: amenities.split(",").map((item) => item.trim()).filter(Boolean),
    })
  }

  async function addRoomType(propertyId: string) {
    const name = window.prompt("Room type name (example: Shared Room)")?.trim()
    if (!name) return
    const price = Number(window.prompt("Monthly price per seat", "20000"))
    const seats = Number(window.prompt("Seat capacity per room", "2"))
    if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(seats) || seats < 1) {
      setMessage("Enter a valid price and seat capacity.")
      return
    }
    try {
      await AdminAPI.createRoomType(propertyId, {
        name,
        pricePerMonth: price,
        seatCapacity: seats,
        hasAC: window.confirm("Does this room type have AC?"),
        isAvailable: true,
      })
      setMessage("Room type created.")
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create room type.")
    }
  }

  async function editRoomType(id: string, currentName: string, currentPrice: string, currentSeats: number) {
    const name = window.prompt("Room type name", currentName)?.trim()
    if (!name) return
    const pricePerMonth = Number(window.prompt("Monthly price", currentPrice))
    const seatCapacity = Number(window.prompt("Seat capacity", String(currentSeats)))
    if (!Number.isFinite(pricePerMonth) || pricePerMonth <= 0 || !Number.isInteger(seatCapacity) || seatCapacity < 1) {
      setMessage("Enter a valid price and seat capacity.")
      return
    }
    try {
      await AdminAPI.updateRoomType(id, { name, pricePerMonth, seatCapacity })
      setMessage("Room type updated.")
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update room type.")
    }
  }

  async function addRoom(roomTypeId: string) {
    const roomLabel = window.prompt("Room label (example: Room 101)")?.trim()
    if (!roomLabel) return
    try {
      await AdminAPI.createRoom(roomTypeId, { roomLabel, isAvailable: true })
      setMessage("Room created.")
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create room.")
    }
  }

  async function renameRoom(id: string, current: string) {
    const roomLabel = window.prompt("Room label", current)?.trim()
    if (!roomLabel || roomLabel === current) return
    try {
      await AdminAPI.updateRoom(id, { roomLabel })
      setMessage("Room updated.")
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update room.")
    }
  }

  async function remove(kind: "room-type" | "room", id: string) {
    if (!window.confirm(`Delete this ${kind}?`)) return
    try {
      if (kind === "room-type") await AdminAPI.deleteRoomType(id)
      else await AdminAPI.deleteRoom(id)
      setMessage(`${kind === "room-type" ? "Room type" : "Room"} deleted.`)
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed.")
    }
  }

  const loading = summary.isLoading || properties.isLoading || bookings.isLoading
  const requestError = summary.error || properties.error || bookings.error

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-20 pt-28 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-950">Admin Management</h1>
          <p className="mt-1 text-slate-600">Welcome, {user?.displayName ?? "Admin"}. Manage only your own inventory.</p>
        </header>

        {message && <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">{message}</div>}
        {requestError && <div className="rounded-xl bg-red-50 p-3 text-red-700">{requestError.message}</div>}
        {loading && <p className="text-slate-500">Loading admin data...</p>}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Properties", summary.data?.properties ?? 0],
            ["Rooms", summary.data?.rooms ?? 0],
            ["Bookings", summary.data?.bookings ?? 0],
            ["Occupancy", `${summary.data?.occupancyPercent ?? 0}%`],
          ].map(([label, value]) => (
            <article key={label} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Portfolio</h2>
              <p className="text-sm text-slate-500">Confirmed revenue: {money(summary.data?.confirmedRevenue ?? 0)}</p>
            </div>
          </div>
        </section>

        <form onSubmit={submitProperty} className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2">
          <h2 className="md:col-span-2 text-xl font-bold">{editing ? "Edit property" : "Create property"}</h2>
          <input required minLength={3} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg border p-3" />
          <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-lg border p-3" />
          <input required placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-lg border p-3 md:col-span-2" />
          <textarea required minLength={10} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-28 rounded-lg border p-3 md:col-span-2" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PropertyInput["type"] })} className="rounded-lg border p-3">
            <option value="HOUSE">House</option><option value="VILLA">Villa</option><option value="APARTMENT">Apartment</option><option value="HOTEL">Hotel</option>
          </select>
          <input required placeholder="Minimum stay" value={form.minStay} onChange={(e) => setForm({ ...form, minStay: e.target.value })} className="rounded-lg border p-3" />
          <input required placeholder="Image URL or /uploads/..." value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="rounded-lg border p-3 md:col-span-2" />
          <input placeholder="Amenities: WiFi, Parking, Kitchen" value={amenities} onChange={(e) => setAmenities(e.target.value)} className="rounded-lg border p-3 md:col-span-2" />
          <input required type="number" step="any" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })} className="rounded-lg border p-3" />
          <input required type="number" step="any" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })} className="rounded-lg border p-3" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active listing</label>
          <div className="flex gap-3 md:justify-end">
            {editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyProperty); setAmenities("") }} className="rounded-lg border px-5 py-3">Cancel</button>}
            <button disabled={saveProperty.isPending} className="rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white disabled:opacity-50">{saveProperty.isPending ? "Saving..." : "Save property"}</button>
          </div>
        </form>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">My Properties & Rooms</h2>
          {properties.data?.length === 0 && <p className="rounded-xl bg-white p-6">No properties yet.</p>}
          {properties.data?.map((property) => (
            <article key={property.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap justify-between gap-3">
                <div><h3 className="text-xl font-bold">{property.title}</h3><p className="text-sm text-slate-500">{property.address}, {property.city}</p></div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(property)} className="rounded-lg border px-3 py-2">Edit</button>
                  <button onClick={() => addRoomType(property.id)} className="rounded-lg bg-slate-900 px-3 py-2 text-white">Add room type</button>
                  <button onClick={() => window.confirm("Delete this property?") && removeProperty.mutate(property.id)} className="rounded-lg bg-red-600 px-3 py-2 text-white">Delete</button>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {property.roomTypes.map((type) => (
                  <div key={type.id} className="rounded-xl border p-4">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div><strong>{type.name}</strong><span className="ml-2 text-sm text-slate-500">{money(type.pricePerMonth)} · {type.seatCapacity} seats/room · {type.hasAC ? "AC" : "Non-AC"}</span></div>
                      <div className="flex gap-2">
                        <button onClick={() => editRoomType(type.id, type.name, type.pricePerMonth, type.seatCapacity)} className="text-sm underline">Edit</button>
                        <button onClick={() => addRoom(type.id)} className="text-sm underline">Add room</button>
                        <button onClick={() => remove("room-type", type.id)} className="text-sm text-red-600 underline">Delete</button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {type.rooms.map((room) => (
                        <span key={room.id} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm">
                          {room.roomLabel} {room.isAvailable ? "✓" : "Unavailable"}
                          <button onClick={() => renameRoom(room.id, room.roomLabel)} aria-label="Edit room">✎</button>
                          <button onClick={() => remove("room", room.id)} className="text-red-600" aria-label="Delete room">×</button>
                        </span>
                      ))}
                      {type.rooms.length === 0 && <span className="text-sm text-slate-500">No rooms.</span>}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="p-5"><h2 className="text-2xl font-bold">Bookings Across My Inventory</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-100"><tr>{["Tenant", "Property", "Room / Seat", "Lease", "Status", "Amount"].map((heading) => <th key={heading} className="p-3">{heading}</th>)}</tr></thead>
              <tbody>
                {bookings.data?.map((booking) => (
                  <tr key={booking.id} className="border-t">
                    <td className="p-3"><strong>{booking.tenant.displayName}</strong><br/><span className="text-slate-500">{booking.tenant.email}</span></td>
                    <td className="p-3">{booking.room.roomType.property.title}</td>
                    <td className="p-3">{booking.room.roomLabel} / Seat {booking.seatNumber}</td>
                    <td className="p-3">{booking.leaseStart.slice(0, 10)} – {booking.leaseEnd.slice(0, 10)}</td>
                    <td className="p-3"><span className="rounded-full bg-orange-100 px-2 py-1">{booking.bookingStatus}</span></td>
                    <td className="p-3">{money(booking.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bookings.data?.length === 0 && <p className="p-6 text-slate-500">No bookings against your inventory.</p>}
        </section>
      </div>
    </main>
  )
}
