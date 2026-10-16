from datetime import UTC, datetime

from smile.modules.catalog.domain.catalog import (
    Axis,
    Category,
    CategoryStatus,
    ParameterSet,
    current_parameters,
)


def _p(version: int, day: int) -> ParameterSet:
    return ParameterSet(
        key="k",
        version=version,
        value={"v": version},
        valid_from=datetime(2026, 10, day, tzinfo=UTC),
    )


def test_current_parameters_picks_latest_valid() -> None:
    sets = [_p(1, 1), _p(2, 10), _p(3, 20)]
    assert current_parameters(sets, datetime(2026, 10, 15, tzinfo=UTC))["k"].version == 2


def test_future_version_not_yet_valid() -> None:
    assert current_parameters([_p(1, 20)], datetime(2026, 10, 15, tzinfo=UTC)) == {}


def test_axes_ordered_by_position() -> None:
    axes = tuple(
        Axis(code=c, name=c, short_name=c, icon=c, position=p) for c, p in (("b", 2), ("a", 1))
    )
    cat = Category(code="fruver", name="Fruver", status=CategoryStatus.ACTIVA, icon="f", axes=axes)
    assert [a.code for a in cat.ordered_axes()] == ["a", "b"]
    assert cat.is_active
