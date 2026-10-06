import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, Star } from 'lucide-react';
import { Ulema } from '../../types';
import { Card } from '../ui/Card';
import { UlemaAvatar } from './UlemaAvatar';

export const UlemaProfileCard: React.FC<{ profile: Ulema }> = ({ profile }) => (
  <Card hoverEffect className="group flex h-full flex-col overflow-hidden p-0">
    <div className="h-1.5 bg-gradient-to-r from-emerald-800 via-emerald-600 to-amber-400" />
    <div className="flex flex-1 flex-col p-5">
      <div className="flex items-start gap-4">
        <UlemaAvatar name={profile.name} src={profile.avatar} className="h-20 w-20 shrink-0 rounded-2xl text-xl shadow-sm ring-4 ring-emerald-50 dark:ring-emerald-950/50" />
        <div className="min-w-0 flex-1 pt-1">
          {profile.isFeatured && <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"><Star className="h-3 w-3 fill-current" />Featured</span>}
          <h2 className="font-serif text-lg font-bold leading-snug text-stone-900 dark:text-stone-100">{profile.name}</h2>
          {profile.arabicName && <div dir="rtl" className="mt-1 text-sm text-amber-700 dark:text-amber-400">{profile.arabicName}</div>}
          <div className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">{profile.title}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-stone-500"><MapPin className="h-3.5 w-3.5 text-emerald-700" />{profile.district}</div>
      <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-relaxed text-stone-600 dark:text-stone-300">{profile.biography}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {profile.specializations.slice(0, 3).map((specialization) => (
          <span key={specialization} className="rounded-lg bg-stone-100 px-2.5 py-1 text-[10px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">{specialization}</span>
        ))}
        {profile.specializations.length > 3 && <span className="px-1 py-1 text-[10px] text-stone-400">+{profile.specializations.length - 3}</span>}
      </div>

      <div className="mt-auto border-t border-stone-100 pt-4 dark:border-stone-800">
        <Link to={`/ulema/${profile.id}`} className="flex items-center justify-between text-sm font-semibold text-emerald-800 transition group-hover:text-emerald-600 dark:text-emerald-300">
          <span>View scholar profile</span><ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  </Card>
);
