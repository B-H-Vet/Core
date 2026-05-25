import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import { users } from '../../../database/schema/auth/users.schema';
import { clients } from '../../../database/schema/clients/clients.schema';
import { pets } from '../../../database/schema/pets/pets.schema';
import { vets } from '../../../database/schema/vets/vets.schema';

import {
  AppointmentEmailInfo,
  IAppointmentInfoRepository,
} from './appointment-info.repository.interface';

@Injectable()
export class AppointmentInfoRepository extends IAppointmentInfoRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async getAppointmentEmailInfo(data: {
    clientId: number;
    petId: number;
    vetId: number;
  }): Promise<AppointmentEmailInfo | null> {
    const clientResult = await this.db
      .select({
        name: users.name,
        email: users.email,
        phone: clients.phone,
      })
      .from(clients)
      .innerJoin(users, eq(clients.user_id, users.id))
      .where(eq(clients.id, data.clientId))
      .limit(1);

    const petResult = await this.db
      .select({
        name: pets.name,
      })
      .from(pets)
      .where(eq(pets.id, data.petId))
      .limit(1);

    const vetResult = await this.db
      .select({
        userId: vets.user_id,
      })
      .from(vets)
      .where(eq(vets.id, data.vetId))
      .limit(1);

    if (!clientResult[0] || !petResult[0] || !vetResult[0]) {
      return null;
    }

    const vetUserResult = await this.db
      .select({
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, vetResult[0].userId))
      .limit(1);

    return {
      clientEmail: clientResult[0].email,
      clientName: clientResult[0].name,
      clientPhone: clientResult[0].phone,
      petName: petResult[0].name,
      vetName: vetUserResult[0]?.name ?? `Veterinario ${String(data.vetId)}`,
    };
  }
}
