import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { DepositBodyDTO } from 'src/accounts/interface/dto/deposit.body.dto';
import { FindAccountsQueryDTO } from 'src/accounts/interface/dto/find-accounts.query.dto';
import { OpenAccountBodyDTO } from 'src/accounts/interface/dto/open-account.body.dto';
import { UpdatePasswordBodyDTO } from 'src/accounts/interface/dto/update-password.body.dto';
import { WithdrawBodyDTO } from 'src/accounts/interface/dto/withdraw.body.dto';
import { RemitBodyDTO } from 'src/accounts/interface/dto/remit.body.dto';
import { WithdrawParamDTO } from 'src/accounts/interface/dto/withdraw.param.dto';
import { DepositParamDTO } from 'src/accounts/interface/dto/deposit.param.dto';
import { RemitParamDTO } from 'src/accounts/interface/dto/remit.param.dto';
import { UpdatePasswordParamDTO } from 'src/accounts/interface/dto/update-password.param.dto';
import { DeleteAccountParamDTO } from 'src/accounts/interface/dto/delete-account.param.dto';
import { DeleteAccountQueryDTO } from 'src/accounts/interface/dto/delete-account.query.dto';
import { FindAccountByIdParamDTO } from 'src/accounts/interface/dto/find-account-by-id.param.dto';

import { CloseAccountCommand } from 'src/accounts/application/commands/close-account.command';
import { DepositCommand } from 'src/accounts/application/commands/deposit.command';
import { OpenAccountCommand } from 'src/accounts/application/commands/open-account.command';
import { UpdatePasswordCommand } from 'src/accounts/application/commands/update-password.command';
import { WithdrawCommand } from 'src/accounts/application/commands/withdraw.command';
import { FindAccountByIdQuery } from 'src/accounts/application/queries/find-account-by-id.query';
import { FindAccountByIdResult } from 'src/accounts/application/queries/find-account-by-id.result';
import { FindAccountsQuery } from 'src/accounts/application/queries/find-accounts.query';
import { FindAccountsResult } from 'src/accounts/application/queries/find-accounts.result';
import { RemitCommand } from 'src/accounts/application/commands/remit.command';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountsController {
  constructor(readonly commandBus: CommandBus, readonly queryBus: QueryBus) {}

  @Post()
  async openAccount(@Body() body: OpenAccountBodyDTO): Promise<void> {
    const command = new OpenAccountCommand(body.name, body.password);
    await this.commandBus.execute(command);
  }

  @Post('/:id/withdraw')
  async withdraw(
    @Param() param: WithdrawParamDTO,
    @Body() body: WithdrawBodyDTO,
  ): Promise<void> {
    const command = new WithdrawCommand(param.id, body.password, body.amount);
    await this.commandBus.execute(command);
  }

  @Post('/:id/deposit')
  async deposit(
    @Param() param: DepositParamDTO,
    @Body() body: DepositBodyDTO,
  ): Promise<void> {
    const command = new DepositCommand(param.id, body.password, body.amount);
    await this.commandBus.execute(command);
  }

  @Post('/:id/remit')
  async remit(
    @Param() param: RemitParamDTO,
    @Body() body: RemitBodyDTO,
  ): Promise<void> {
    const command = new RemitCommand(
      param.id,
      body.receiverId,
      body.amount,
      body.password,
    );
    await this.commandBus.execute(command);
  }

  @Put('/:id/password')
  async updatePassword(
    @Param() param: UpdatePasswordParamDTO,
    @Body() body: UpdatePasswordBodyDTO,
  ): Promise<void> {
    const command = new UpdatePasswordCommand(
      param.id,
      body.current,
      body.data,
    );
    await this.commandBus.execute(command);
  }

  @Delete('/:id')
  async closeAccount(
    @Param() param: DeleteAccountParamDTO,
    @Query() query: DeleteAccountQueryDTO,
  ): Promise<void> {
    const command = new CloseAccountCommand(param.id, query.password);
    await this.commandBus.execute(command);
  }

  @Get()
  async findAccounts(
    @Query() queryDto: FindAccountsQueryDTO,
  ): Promise<{ accounts: FindAccountsResult }> {
    const query = new FindAccountsQuery(queryDto.offset, queryDto.limit);
    return { accounts: await this.queryBus.execute(query) };
  }

  @Get('/:id')
  async findAccountById(
    @Param() param: FindAccountByIdParamDTO,
  ): Promise<FindAccountByIdResult> {
    const query = new FindAccountByIdQuery(param.id);
    return this.queryBus.execute(query);
  }
}
