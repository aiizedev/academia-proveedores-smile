"""GET /me: datos de la cuenta autenticada (HU-IAM-02)."""

from smile.modules.iam.application.ports.repositories import UserRepository
from smile.modules.iam.domain.user import User
from smile.shared.application.ports import CurrentUser
from smile.shared.domain.errors import AuthenticationError


class GetMe:
    def __init__(self, users: UserRepository) -> None:
        self._users = users

    async def __call__(self, current: CurrentUser) -> User:
        user = await self._users.get(current.id)
        if user is None or not user.is_active:
            raise AuthenticationError("La sesión no es válida; ingrese de nuevo")
        return user
